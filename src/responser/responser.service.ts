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
import { MqttClientService } from 'src/mqtt-client/mqtt-client.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HardwareStatus } from '@/device/repository/hardware-status.entity';
import { Telemetry } from '@/device/repository/sensor-telemetry.entity';
import { DeviceService } from '@/device/device.service';
import { ResponseMessageCode } from '@/common';
import { GatewayService } from '@/gateway/gateway.service';
import { Sensor } from '@/device/repository/sensor.entity';

@Injectable()
export class ResponserService {
  constructor(
    @InjectRepository(Sensor)
    private readonly sensorRepo: Repository<Sensor>,
    @InjectRepository(HardwareStatus)
    private readonly hardwareStatusRepo: Repository<HardwareStatus>,

    @InjectRepository(Telemetry)
    private readonly telemetryRepo: Repository<Telemetry>,

    private readonly deviceService: DeviceService,
    private readonly mqttClient: MqttClientService,
    private readonly redisCache: RedisService,
    private readonly topicService: TopicService,
    private readonly eventEmitter: EventEmitter2,
    private readonly gatewayService: GatewayService,
  ) {}

  private readonly logger = new Logger(ResponserService.name, {
    timestamp: true,
  });

  private async deleteCache(dto: any) {
    const { requestId } = dto;

    if (!requestId) {
      this.logger.error('Request id required for cache delete');
      return;
    }

    await this.redisCache.del(`pending:${requestId}`);
    this.logger.debug('Cached request id deleted successfully');
  }

  public async handleDiscoveryResponse(payload: DiscoveryResponseDto) {
    const { deviceId, sensorData } = payload;

    const storedDevice = await this.sensorRepo.findOne({
      where: { deviceId },
    });

    // try {
    if (storedDevice?.isDeleted) {
      await this.sensorRepo.update({ deviceId }, { isDeleted: false });
    }
    const { topic } = await this.topicService.createDeviceBaseTopic(deviceId);

    if (!storedDevice) {
      try {
        const deviceRecord = this.sensorRepo.create({
          ...sensorData,
          deviceId,
          provisionState: ProvisionState.DISCOVERED,
          isActuator: false,
          isDeleted: false,
        });
        await this.sensorRepo.save(deviceRecord);

        // Create and subscribe device's base topic
        await this.mqttClient.subscribe(topic);

        // Create and subscibe all topics specified for device
        const otherTopics =
          await this.topicService.createAllTopicsForDevice(deviceId);
        const topicNames = otherTopics.map((topic) => topic.topic);
        await this.mqttClient.subscribe(topicNames);

        this.logger.debug(`Device ${deviceId} added to database`);
      } catch (error) {
        throw new ForbiddenException('Discovery data malformed');
      }
    }
    // ---> Web Socket gateway
    this.gatewayService.emitDiscoveryBroadcastMessage(payload);

    // Delete cached request appropriate to this response if its unicast
    if (!payload.isBroadcast) {
      await this.deleteCache(payload);
    }
  }

  async handleAssignResponse(payload: SensorFunctionalityResponseDto) {
    const { responseCode, deviceId, functionality, status } = payload;

    if (responseCode !== ResponseMessageCode.RESPONSE_ASSIGN_DEVICE_FUNCTION) {
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
      { deviceId },
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

    if (responseCode !== ResponseMessageCode.RESPONSE_FIRMWARE_UPDATE_STATUS)
      return;

    if (status === UpgradeStatus.PROCESSING) {
      this.logger.debug(`Sensor ${deviceId} firmware upgrade processing...`);
      return `Processing... ${progress} %`;
    }

    if (status === UpgradeStatus.SUCCESS) {
      await this.sensorRepo.update(
        { deviceId },
        {
          lastUpgrade: new Date(timestamp),
        },
      );

      await this.deleteCache(payload);

      this.logger.log(`Sensor ${deviceId} upgraded successfully`);
    }

    this.logger.error(`Sensor ${deviceId} upgrade failed`);
  }

  async handleDeviceHeartbeat(payload: HeartbeatDto) {
    const { connectionState, deviceId, responseCode } = payload;

    if (responseCode != ResponseMessageCode.RESPONSE_HEARTBEAT) return;

    const sensor = await this.sensorRepo.findOne({
      where: { deviceId },
    });

    if (!sensor) {
      throw new ForbiddenException('Device not found');
    }

    await this.sensorRepo.update(
      { deviceId },
      {
        connectionState,
      },
    );

    await this.deleteCache(payload);

    this.logger.debug(`Sensor ${deviceId} heartbeat received`);
  }

  async handleRebootResponse(payload: DeviceRebootResponseDto) {
    const { deviceId, responseCode, status, message, timestamp } = payload;

    if (responseCode !== ResponseMessageCode.RESPONSE_REBOOT_CONFIRMATION)
      return;

    if (status !== RebootStatus.SUCCESS) {
      this.logger.error(`Sensor ${deviceId} reboot failed`);
    }

    await this.sensorRepo.update(
      { deviceId },
      {
        lastReboot: new Date(timestamp),
      },
    );
    await this.deleteCache(payload);
    this.logger.log(`Sensor ${deviceId} rebooted`);
  }

  async handleTelemetryResponse(payload: TelemetryResponseDto) {
    const { responseCode, deviceId, metric, value, meta } = payload;

    if (responseCode !== ResponseMessageCode.RESPONSE_TELEMETRY_DATA) {
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

    if (responseCode !== ResponseMessageCode.RESPONSE_HARDWARE_METRICS) {
      throw new UnauthorizedException('Invalid response');
    }

    const record = await this.sensorRepo.findOne({
      where: {
        deviceId: statusData.deviceId,
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
