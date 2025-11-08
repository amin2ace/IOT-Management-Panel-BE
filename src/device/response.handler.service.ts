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
  HardwareStatusResponseDto,
  HeartbeatDto,
  ResponseMessageCode,
  SensorFunctionalityResponseDto,
  TelemetryResponseDto,
} from './messages';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sensor } from './repository/sensor.entity';
import { RedisService } from 'src/redis/redis.service';
import { LogAction } from 'src/log-handler/enum/log-action.enum';
import { LogContext } from 'src/log-handler/enum/log-context.enum';
import { DeviceService } from './device.service';
import { AckStatus } from 'src/config/enum/ack-status.enum';
import { ProvisionState } from 'src/config/enum/provision-state.enum';
import { UpgradeStatus } from 'src/config/enum/upgrade-status.enum';
import { RebootStatus } from 'src/config/enum/reboot-status.enum';
import { Telemetry } from './repository/sensor-telemetry.entity';
import { HardwareStatus } from './repository/hardware-status.entity';
import { LogHandlerService } from 'src/log-handler/log-handler.service';

@Injectable()
export class ResponseHandlerService {
  constructor(
    @InjectRepository(Sensor) private readonly sensorRepo: Repository<Sensor>,
    @InjectRepository(HardwareStatus)
    private readonly hardwareStatusRepo: Repository<HardwareStatus>,

    @InjectRepository(Telemetry)
    private readonly telemetryRepo: Repository<Telemetry>,

    private readonly redisCache: RedisService,
    private readonly logger: LogHandlerService,
    private readonly deviceService: DeviceService,
  ) {}

  private async deleteCache(dto: any) {
    const { requestId } = dto;

    if (!requestId) {
      this.logger.fail(
        LogContext.CACHE,
        'CacheDelete',
        LogAction.DELETE,
        'Request id required for deleting cache',
      );
      return;
    }

    await this.redisCache.del(`pending:${requestId}`);
    this.logger.success(
      LogContext.CACHE,
      'CacheDelete',
      LogAction.DELETE,
      `Cache deleted for requestId=${requestId}`,
    );
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

    await this.deleteCache(SensorFunctionalityResponseDto);

    this.logger.success(
      LogContext.MESSAGE,
      'AssignDeviceFunction',
      LogAction.RESPONSE,
      `Sensor ${deviceId} assigned to ${functionality}`,
    );
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

      await this.deleteCache(FwUpgradeResponseDto);

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

    await this.deleteCache(HeartbeatDto);

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
    await this.deleteCache(DeviceRebootResponseDto);

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

    await this.deleteCache(TelemetryResponseDto);

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

    await this.deleteCache(HardwareStatusResponseDto);

    this.logger.success(
      LogContext.HARDWARE,
      'HardwareStatus',
      LogAction.RESPONSE,
      `Hardware status from ${statusData.deviceId} retrieved`,
    );
  }

  async handleAckMessage(payload: AckResponseDto) {
    throw new Error('Method not implemented.');
  }

  async handleUnknownMessage(payload: any) {
    return false;
  }
}
