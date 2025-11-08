import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { QueryDeviceDto } from './dto/query-device.dto';
import { ControlDeviceDto } from './dto/control-device.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Sensor } from './repository/sensor.entity';
import { Repository } from 'typeorm';
import { MqttClientService } from 'src/mqtt-client/mqtt-client.service';
import { plainToInstance } from 'class-transformer';
import { ProvisionState } from 'src/config/enum/provision-state.enum';
import {
  AckResponseDto,
  DeviceRebootResponseDto,
  DiscoveryRequestDto,
  DiscoveryResponseDto,
  FwUpgradeResponseDto,
  HeartbeatDto,
  RequestMessageCode,
  ResponseMessageCode,
  SensorConfigRequestDto,
  SensorFunctionalityRequestDto,
  SensorMetricDto,
} from './messages';
import { TelemetryDto } from './messages/listening/telemetry.response.dto';
import { Telemetry } from './repository/sensor-telemetry.entity';
import { TopicService } from 'src/topic/topic.service';
import { ConfigService } from '@nestjs/config';
import { TopicUseCase } from 'src/topic/enum/topic-usecase.enum';
import { RebootStatus } from 'src/config/enum/reboot-status.enum';
import { UpgradeStatus } from 'src/config/enum/upgrade-status.enum';
import { RedisService } from 'src/redis/redis.service';
import { SensorFunctionalityResponseDto } from './messages/listening/sensor-functionality.response.dto';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Sensor) private readonly sensorRepo: Repository<Sensor>,
    @InjectRepository(Telemetry)
    private readonly telmetryRepo: Repository<Telemetry>,
    private readonly mqttService: MqttClientService,
    private readonly topicService: TopicService,
    private readonly redisCache: RedisService,
    private readonly config: ConfigService,
  ) {}

  private readonly logger = new Logger(DeviceService.name, {
    timestamp: true,
  });

  async getSensors(query: QueryDeviceDto): Promise<Sensor[]> {
    const { deviceId, provisionState, functionality } = query;

    // Build dynamic query
    const qb = this.sensorRepo.createQueryBuilder('device');

    if (provisionState) {
      qb.andWhere('device.provisionState = :provisionState', {
        provisionState,
      });
    }
    if (functionality) {
      qb.andWhere('device.functionality = :functionality', { functionality });
    }
    if (deviceId) {
      qb.andWhere('device.deviceId = :deviceId', { deviceId });
    }

    return await qb.getMany();
  }

  private async setCache(dto: any) {
    const { deviceId, requestId, requestCode, userId } = dto;

    this.redisCache.set(`pending:${requestId}`, {
      userId,
      requestCode,
      deviceId,
    });
  }
  async discoverDevices(discoverRequest: DiscoveryRequestDto) {
    const broadcastTopic = await this.topicService.getBroadcastTopic();

    const { isBroadcast, deviceId, requestCode } = discoverRequest;

    if (requestCode !== RequestMessageCode.DISCOVERY) return;

    if (isBroadcast && !deviceId) {
      // cache the request id for validation with response id
      this.setCache(discoverRequest);

      // Then publish message
      this.mqttService.publish(
        broadcastTopic,
        JSON.stringify(discoverRequest),
        { qos: 0, retain: false },
      );
      return { message: 'Discovery request broadcasted' };
    }

    if (deviceId && !isBroadcast) {
      const sensorTopic = await this.topicService.getTopicByDeviceId(
        deviceId,
        TopicUseCase.DISCOVERY,
      );
      if (!sensorTopic.topic) {
        this.logger.error(`Discovery topic for ${deviceId} is required`);
        throw new ForbiddenException(
          `Discovery topic for ${deviceId} is required`,
        );
      }

      this.mqttService.publish(
        sensorTopic.topic,
        JSON.stringify(discoverRequest),
        { qos: 0, retain: false },
      );
      return { message: `Discovery request sent to device ${deviceId}` };
    }
  }

  async getUnassignedSensor(): Promise<Sensor[]> {
    const sensors = await this.sensorRepo.find({
      where: {
        provisionState: ProvisionState.DISCOVERED,
        isDeleted: false,
      },
    });
    if (!sensors.length) {
      this.logger.log('No unassigned devices found');
      throw new NotFoundException('No unassigned devices found');
    }
    return sensors;
  }

  async mapRawPayload(rawPayload: any): Promise<DiscoveryResponseDto> {
    // Map raw payload to DTO
    const payload = plainToInstance(DiscoveryResponseDto, {
      clientId: rawPayload.clientId,
      macAddress: rawPayload.macAddress,
      ipAddress: rawPayload.ipAddress,
      firmwareVersion: rawPayload.firmwareVersion,
      deviceType: rawPayload.deviceType,
      capabilities: rawPayload.capabilities, // array of SensorType
      connectTime: rawPayload.connectTime,
      state: rawPayload.state,
      location: rawPayload.location,
      protocol: rawPayload.protocol,
      broker: rawPayload.broker,
      additionalInfo: rawPayload.additionalInfo,
    });

    return payload;
  }

  public async storeSensorInDatabase(
    sensorMessage: DiscoveryResponseDto,
  ): Promise<string> {
    const { deviceId } = sensorMessage;
    const BASE_TOPIC = this.config.getOrThrow<string>('BASE_TOPIC');

    const existingDevice = await this.sensorRepo.findOne({
      where: { sensorId: deviceId },
    });

    try {
      if (existingDevice?.isDeleted) {
        await this.sensorRepo.update(
          { sensorId: deviceId },
          { isDeleted: false },
        );
      }

      if (!existingDevice) {
        const { topic } =
          await this.topicService.createDeviceBaseTopic(deviceId);

        const deviceRecord = this.sensorRepo.create({
          ...sensorMessage,
          provisionState: ProvisionState.DISCOVERED,
          deviceBaseTopic: topic,
          isActuator: false,
          isDeleted: false,
        });
        await this.sensorRepo.save(deviceRecord);
      }

      return 'Device saved to database';
    } catch (error) {
      console.error('Error saving device to database:', error.message);
      return 'Error saving device to database';
    }
  }

  async getDeviceById(sensorId: string): Promise<Sensor> {
    const device = await this.sensorRepo.findOne({
      where: {
        isDeleted: false,
        sensorId,
      },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${sensorId} not found`);
    }

    return device;
  }

  async provisionDevice(
    sensorId: string,
    provisionData: SensorFunctionalityRequestDto,
  ): Promise<string> {
    const { deviceId, functionality, requestCode } = provisionData;

    if (requestCode !== RequestMessageCode.ASSIGN_DEVICE_FUNCTION) {
      throw new BadRequestException('Invalid Request');
    }

    const { topic } = await this.topicService.createTopic(
      deviceId,
      TopicUseCase.ASSIGN_DEVICE_FUNCTION,
    );

    const storedDevice = await this.sensorRepo.findOne({
      where: {
        sensorId: deviceId,
      },
    });

    if (!storedDevice) {
      throw new NotFoundException('Device not found');
    }

    // Validate that all requested functionality exists in device capabilities
    const invalidSensorTypes = functionality.filter(
      (sensorType) => !storedDevice.capabilities.includes(sensorType),
    );

    if (invalidSensorTypes.length > 0) {
      throw new BadRequestException(
        `Device does not support the following functionalities: ${invalidSensorTypes.join(', ')}`,
      );
    }

    this.mqttService.publish(topic, JSON.stringify(provisionData), {
      qos: 1,
      retain: false,
    });

    this.setCache(provisionData);

    return `Device with id of ${sensorId} provisioned as ${functionality}`;
  }

  async handleAssignMessage(provisionData: SensorFunctionalityResponseDto) {
    const { responseCode, deviceId, functionality } = provisionData;

    if (responseCode !== ResponseMessageCode.DEVICE_FUNCTION_ASSIGNED) {
      throw new ForbiddenException('Invalid Response');
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
  }

  async deleteSensor(sensorId: string): Promise<string> {
    const device = await this.sensorRepo.findOne({
      where: {
        sensorId,
        isDeleted: false,
      },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${sensorId} not found`);
    }

    await this.sensorRepo.update({ sensorId }, { isDeleted: true });
    return `Device with ID ${sensorId} marked as deleted`;
  }

  async reconfigureDevice(configData: SensorConfigRequestDto) {
    const { sensorId, requestCode } = configData;
    if (requestCode != RequestMessageCode.SENSOR_CONFIGURATION) return;

    const storedDevice = await this.sensorRepo.findOne({
      where: {
        sensorId,
        isDeleted: false,
      },
    });

    if (!storedDevice) {
      throw new NotFoundException(`Device with id ${sensorId} not found`);
    }

    const { topic: publishTopic } = await this.topicService.createTopic(
      sensorId,
      TopicUseCase.SENSOR_CONFIGURATION,
    );

    const ackTopic = `${publishTopic}/ack`;

    await this.mqttService.publish(publishTopic, JSON.stringify(configData), {
      qos: 1,
      retain: false,
    });

    await this.mqttService.subscribe(ackTopic, sensorId);
  }

  // async getLiveStatus(sensorId: string) {
  //   const sensor = await this.sensorRepo.findOne({
  //     where: {
  //       sensorId,
  //     },
  //   });
  //   if (!sensor) {
  //     throw new NotFoundException(`Device with ID ${sensorId} not found`);
  //   }

  //   return { status: sensor.connectionState };
  // }

  getDeviceHistory(id: string) {
    return { message: 'History data', id };
  }

  controlDevice(id: string, data: ControlDeviceDto) {
    return { message: 'Control command', id, data };
  }

  async getDeviceStatus(sensorId: string) {
    const sensor = await this.sensorRepo.findOne({
      where: {
        sensorId,
      },
    });
    if (!sensor) {
      throw new NotFoundException(`Device with ID ${sensorId} not found`);
    }

    return {
      id: sensor.sensorId,
      state: sensor.provisionState,
      error: sensor.hasError,
      available: sensor.isDeleted ? false : true,
      connection: sensor.connectionState,
    };
  }

  async handleSensorTelemetry(payload: TelemetryDto) {
    const { deviceId, metric, value, meta, status } = payload;
    const record = this.telmetryRepo.create({
      deviceId,
      metric,
      value,
      meta,
      status,
    });

    this.telmetryRepo
      .save(record)
      .then(() => this.logger.log(`Device ${deviceId} telemetry saved`))
      .catch((err) => this.logger.error(err));
    throw new Error('Method not implemented.');
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

    return 'success';
  }

  async handleDeviceMetrics(payload: SensorMetricDto) {
    throw new Error('Method not implemented.');
  }
  async handleRebootResponse(payload: DeviceRebootResponseDto) {
    const { deviceId, responseCode, status, message, timestamp } = payload;

    if (responseCode !== ResponseMessageCode.REBOOT_CONFIRMATION) return;

    if (status !== RebootStatus.SUCCESS) {
      this.logger.error(`Device ${deviceId} reboot failed`, {
        description: message,
      });
    }

    await this.sensorRepo.update(
      { sensorId: deviceId },
      {
        lastReboot: new Date(timestamp),
      },
    );

    this.logger.log(`Device ${deviceId} rebooted successfully`);
  }

  async handleUpgradeResponse(payload: FwUpgradeResponseDto) {
    const {
      deviceId,
      progress,
      requestId,
      responseCode,
      responseId,
      status,
      timestamp,
    } = payload;

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
      this.logger.log(`Device ${deviceId} upgraded successfully`);
    }
    this.logger.error(`Device ${deviceId} upgrade failed`);
  }

  async handleAckMessage(payload: AckResponseDto) {
    throw new Error('Method not implemented.');
  }
}
