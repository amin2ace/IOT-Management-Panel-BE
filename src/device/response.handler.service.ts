import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AckResponseDto,
  DeviceRebootResponseDto,
  FwUpgradeResponseDto,
  HardwareStatusRequestDto,
  HardwareStatusResponseDto,
  HeartbeatDto,
  RequestMessageCode,
  ResponseMessageCode,
  SensorFunctionalityResponseDto,
  TelemetryResponseDto,
} from './messages';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sensor } from './repository/sensor.entity';
import { TopicService } from 'src/topic/topic.service';
import { TopicUseCase } from 'src/topic/enum/topic-usecase.enum';
import { RedisService } from 'src/redis/redis.service';
import { MqttClientService } from 'src/mqtt-client/mqtt-client.service';
import { LogAction, LogContext, LoggerHandlerService } from 'src/common';
import { DeviceService } from './device.service';
import { AckStatus } from 'src/config/enum/ack-status.enum';
import { ProvisionState } from 'src/config/enum/provision-state.enum';
import { UpgradeStatus } from 'src/config/enum/upgrade-status.enum';
import { RebootStatus } from 'src/config/enum/reboot-status.enum';
import { Telemetry } from './repository/sensor-telemetry.entity';
import { HardwareStatus } from './repository/hardware-status.entity';

@Injectable()
export class ResponseHandlerService {
  constructor(
    @InjectRepository(Sensor) private readonly sensorRepo: Repository<Sensor>,
    @InjectRepository(HardwareStatus)
    private readonly hardwareStatusRepo: Repository<HardwareStatus>,

    @InjectRepository(Telemetry)
    private readonly telemetryRepo: Repository<Telemetry>,

    private readonly topicService: TopicService,
    private readonly mqttService: MqttClientService,
    private readonly redisCache: RedisService,
    private readonly logger: LoggerHandlerService,
    private readonly deviceService: DeviceService,
  ) {}

  private async setCache(dto: any) {
    const { deviceId, requestId, requestCode, userId } = dto;

    this.redisCache.set(`pending:${requestId}`, {
      userId,
      requestCode,
      deviceId,
    });
  }

  async handleAssignResponse(provisionData: SensorFunctionalityResponseDto) {
    const { responseCode, deviceId, functionality, status } = provisionData;

    if (responseCode !== ResponseMessageCode.DEVICE_FUNCTION_ASSIGNED) {
      throw new ForbiddenException('Invalid Response');
    }

    await this.deviceService.validateSensorTypes(deviceId, functionality);

    if (status !== AckStatus.ACCEPTED) {
      this.logger.fail(
        LogContext.MESSAGE,
        'AssignDeviceFunction',
        LogAction.RESPONSE,
        `Sensor ${deviceId} assignement failed`,
      );
      throw new BadRequestException('Sensor functionality assign failed');
    }

    await this.sensorRepo.update(
      {
        sensorId: deviceId,
      },
      {
        assignedFunctionality: functionality,
        provisionState: ProvisionState.ASSIGNED,
      },
    );

    this.logger.success(
      LogContext.MESSAGE,
      'AssignDeviceFunction',
      LogAction.RESPONSE,
      `Sensor ${deviceId} assigned to ${functionality}`,
    );
  }

  async handleAckMessage(payload: AckResponseDto) {
    throw new Error('Method not implemented.');
  }

  async handleUpgradeResponse(payload: FwUpgradeResponseDto) {
    const { deviceId, progress, responseCode, status, timestamp } = payload;

    if (responseCode !== ResponseMessageCode.FIRMWARE_UPDATE_STATUS) return;

    if (status === UpgradeStatus.PROCESSING) {
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
      this.logger.success(
        LogContext.MESSAGE,
        'FirmwareUpgrade',
        LogAction.RESPONSE,
        `Sensor ${deviceId} upgraded to successfully`,
      );
    }
    this.logger.fail(
      LogContext.MESSAGE,
      'FirmwareUpgrade',
      LogAction.RESPONSE,
      `Sensor ${deviceId} upgrade failed`,
    );
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
      this.logger.fail(
        LogContext.MESSAGE,
        'DeviceHeartbeat',
        LogAction.RESPONSE,
        `Sensor ${deviceId} heartbeat failed`,
      );
      throw new ForbiddenException('Device not found');
    }

    await this.sensorRepo.update(
      { sensorId: deviceId },
      {
        connectionState,
      },
    );

    this.logger.success(
      LogContext.MESSAGE,
      'DeviceHeartbeat',
      LogAction.RESPONSE,
      `Sensor ${deviceId} heartbeat received`,
    );
  }

  async handleRebootResponse(payload: DeviceRebootResponseDto) {
    const { deviceId, responseCode, status, message, timestamp } = payload;

    if (responseCode !== ResponseMessageCode.REBOOT_CONFIRMATION) return;

    if (status !== RebootStatus.SUCCESS) {
      this.logger.fail(
        LogContext.MESSAGE,
        'HardwareReboot',
        LogAction.RESPONSE,
        message ? message : `Sensor ${deviceId} reboot failed`,
      );
    }

    await this.sensorRepo.update(
      { sensorId: deviceId },
      {
        lastReboot: new Date(timestamp),
      },
    );

    this.logger.success(
      LogContext.MESSAGE,
      'HardwareReboot',
      LogAction.RESPONSE,
      `Sensor ${deviceId} rebooted successfully`,
    );
  }

  async handleTelemetryResponse(payload: TelemetryResponseDto) {
    const { responseCode, deviceId, metric, value, meta } = payload;

    if (responseCode !== ResponseMessageCode.TELEMETRY_DATA) {
      this.logger.fail(
        LogContext.TELEMETRY,
        'DeviceTelemetry',
        LogAction.RESPONSE,
        `Sensor ${deviceId} telemtry failed`,
      );
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
      .then(() => this.logger.log(`Device ${deviceId} telemetry saved`))
      .catch((err) => this.logger.error(err));

    this.logger.success(
      LogContext.TELEMETRY,
      'DeviceTelemetry',
      LogAction.RESPONSE,
      `Telemetry:::${deviceId}:::${record.metric}:::${record.value}:::${record.meta}`,
    );
  }

  async handleHardwareStatus(payload: HardwareStatusResponseDto) {
    const { responseCode, requestId, ...statusData } = payload;

    if (responseCode !== ResponseMessageCode.HARDWARE_METRICS) {
      this.logger.fail(
        LogContext.HARDWARE,
        'HardwareStatus',
        LogAction.RESPONSE,
        `Hardware status from ${statusData.deviceId} failed`,
      );
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
    this.logger.success(
      LogContext.HARDWARE,
      'HardwareStatus',
      LogAction.RESPONSE,
      `Hardware status from ${statusData.deviceId} retrieved`,
    );
  }

  async handleUnknownMessage(payload: any) {
    return false;
  }
}
