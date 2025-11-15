import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AckResponseDto,
  DeviceRebootResponseDto,
  DiscoveryResponseDto,
  FwUpgradeResponseDto,
  HardwareStatusResponseDto,
  HeartbeatDto,
  SensorFunctionalityResponseDto,
  TelemetryResponseDto,
} from './dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from 'src/redis/redis.service';
import { AckStatus } from 'src/config/enum/ack-status.enum';
import { ProvisionState } from 'src/config/enum/provision-state.enum';
import { UpgradeStatus } from 'src/config/enum/upgrade-status.enum';
import { RebootStatus } from 'src/config/enum/reboot-status.enum';
import { TopicService } from 'src/topic/topic.service';
import { TopicUseCase } from 'src/topic/enum/topic-usecase.enum';
import { MqttClientService } from 'src/mqtt-client/mqtt-client.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Sensor } from '@/device/repository/sensor.entity';
import { HardwareStatus } from '@/device/repository/hardware-status.entity';
import { Telemetry } from '@/device/repository/sensor-telemetry.entity';
import { DeviceService } from '@/device/device.service';
import { ResponseMessageCode } from '@/common';

@Injectable()
export class ResponserService {
  constructor(
    @InjectRepository(Sensor) private readonly sensorRepo: Repository<Sensor>,
    @InjectRepository(HardwareStatus)
    private readonly hardwareStatusRepo: Repository<HardwareStatus>,

    @InjectRepository(Telemetry)
    private readonly telemetryRepo: Repository<Telemetry>,

    private readonly deviceService: DeviceService,
    private readonly mqttClient: MqttClientService,
    private readonly redisCache: RedisService,
    private readonly topic: TopicService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private readonly logger = new Logger(ResponserService.name, {
    timestamp: true,
  });

  private async deleteCache(dto: any) {
    const { requestId } = dto;

    if (!requestId) {
      this.logger.error('Request id required for deleting cache', {
        context: 'Cache Delete',
      });
      return;
    }

    await this.redisCache.del(`pending:${requestId}`);
    this.logger.debug('Cache deleted successfully', {
      context: 'Cache Delete',
    });
  }

  public async handleDiscoveryResponse(payload: DiscoveryResponseDto) {
    const { deviceId } = payload;

    const existingDevice = await this.sensorRepo.findOne({
      where: { sensorId: deviceId },
    });

    // try {
    if (existingDevice?.isDeleted) {
      await this.sensorRepo.update(
        { sensorId: deviceId },
        { isDeleted: false },
      );
    }

    if (!existingDevice) {
      const { topic } = await this.topic.createDeviceBaseTopic(deviceId);

      const deviceRecord = this.sensorRepo.create({
        ...payload,
        sensorId: deviceId,
        provisionState: ProvisionState.DISCOVERED,
        deviceBaseTopic: topic,
        isActuator: false,
        isDeleted: false,
      });
      await this.sensorRepo.save(deviceRecord);

      // Create and subscribe to all device's topics
      for (const useCase of Object.values(TopicUseCase)) {
        const { topic } = await this.topic.createTopic(deviceId, useCase);
        await this.mqttClient.subscribe(topic);
      }
      // Subscribe to device base topic
      await this.mqttClient.subscribe(topic);
      // ✨ ADD THIS: Emit event for WebSocket broadcast
      this.eventEmitter.emit('/ws/message/discovery', payload);
    }

    await this.deleteCache(payload);
    this.logger.debug(`Device ${deviceId} added to database`);
  }

  async handleAssignResponse(payload: SensorFunctionalityResponseDto) {
    const { responseCode, deviceId, functionality, status } = payload;

    if (responseCode !== ResponseMessageCode.DEVICE_FUNCTION_ASSIGNED) {
      throw new ForbiddenException('Invalid Response');
    }

    if (status !== AckStatus.ACCEPTED) {
      this.logger.debug(
        `Sensor functionality assign not accepted for device ${deviceId}`,
      );
      throw new BadRequestException('Sensor functionality assign not accepted');
    }

    await this.deviceService.validateSensorTypes(deviceId, functionality);

    await this.sensorRepo.update(
      {
        sensorId: deviceId,
      },
      {
        assignedFunctionality: functionality,
        provisionState: ProvisionState.ASSIGNED,
      },
    );

    await this.deleteCache(payload);

    this.logger.log(`Sensor ${deviceId} assigned to ${functionality}`);
  }

  async handleUpgradeResponse(payload: FwUpgradeResponseDto) {
    const { deviceId, progress, responseCode, status, timestamp } = payload;

    if (responseCode !== ResponseMessageCode.FIRMWARE_UPDATE_STATUS) return;

    if (status === UpgradeStatus.PROCESSING) {
      this.logger.debug(`Sensor ${deviceId} firmware upgrade processing...`);
      return `Processing... ${progress} %`;
    }

    if (status === UpgradeStatus.SUCCESS) {
      await this.sensorRepo.update(
        {
          sensorId: deviceId,
        },
        {
          lastUpgrade: new Date(timestamp),
        },
      );

      await this.deleteCache(payload);

      this.logger.log(`Sensor ${deviceId} upgraded to successfully`);
    }

    this.logger.warn(`Sensor ${deviceId} upgrade failed`);
  }

  async handleDeviceHeartbeat(payload: HeartbeatDto) {
    const { connectionState, deviceId, responseCode } = payload;

    if (responseCode != ResponseMessageCode.HEARTBEAT) return;

    const sensor = await this.sensorRepo.findOne({
      where: {
        sensorId: deviceId,
      },
    });

    if (!sensor) {
      throw new ForbiddenException('Device not found');
    }

    await this.sensorRepo.update(
      { sensorId: deviceId },
      {
        connectionState,
      },
    );

    await this.deleteCache(payload);

    this.logger.debug(`Sensor ${deviceId} heartbeat received`);
  }

  async handleRebootResponse(payload: DeviceRebootResponseDto) {
    const { deviceId, responseCode, status, message, timestamp } = payload;

    if (responseCode !== ResponseMessageCode.REBOOT_CONFIRMATION) return;

    if (status !== RebootStatus.SUCCESS) {
      this.logger.warn(`Sensor ${deviceId} reboot failed`);
    }

    await this.sensorRepo.update(
      { sensorId: deviceId },
      {
        lastReboot: new Date(timestamp),
      },
    );
    await this.deleteCache(payload);
    this.logger.log(`Sensor ${deviceId} rebooted`);
  }

  async handleTelemetryResponse(payload: TelemetryResponseDto) {
    const { responseCode, deviceId, metric, value, meta } = payload;

    if (responseCode !== ResponseMessageCode.TELEMETRY_DATA) {
      throw new BadRequestException(`Invalid response`);
    }

    const record = this.telemetryRepo.create({
      deviceId,
      metric,
      value,
      meta,
    });

    this.telemetryRepo
      .save(record)
      .then(() => this.logger.debug(`Device ${deviceId} telemetry saved`))
      .catch((err) => this.logger.error(err));

    await this.deleteCache(payload);
  }

  async handleHardwareStatus(payload: HardwareStatusResponseDto) {
    const { responseCode, requestId, ...statusData } = payload;

    if (responseCode !== ResponseMessageCode.HARDWARE_METRICS) {
      throw new UnauthorizedException('Invalid response');
    }

    const record = await this.sensorRepo.findOne({
      where: {
        sensorId: statusData.deviceId,
        isDeleted: false,
      },
    });

    if (!record) {
      throw new NotFoundException('Device not found');
    }
    const statusRecord = this.hardwareStatusRepo.create({
      ...statusData,
      timestamp: new Date(statusData.timestamp),
    });

    await this.hardwareStatusRepo.save(statusRecord);

    await this.deleteCache(payload);
    this.logger.debug(`Sensor ${statusData.deviceId} hardware status saved`);
  }

  async handleAckMessage(payload: AckResponseDto) {
    throw new Error('Method not implemented.');
  }

  async handleUnknownMessage(payload: any) {
    return false;
  }
}
