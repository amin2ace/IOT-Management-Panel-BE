import {
  BadRequestException,
  ForbiddenException,
  Injectable,
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
  DiscoveryRequestDto,
  DiscoveryResponseDto,
  RequestMessageCode,
  SensorConfigRequestDto,
  SensorFunctionalityRequestDto,
} from './messages';
import { TopicService } from 'src/topic/topic.service';
import { TopicUseCase } from 'src/topic/enum/topic-usecase.enum';
import { RedisService } from 'src/redis/redis.service';
import { SensorType } from 'src/config/enum/sensor-type.enum';
import { TelemetryRequestDto } from './messages/publish/telemetry.request.dto';
import { HardwareStatusRequestDto } from './messages/publish/hardware-status.request';
import { LogHandlerService } from 'src/log-handler/log-handler.service';
import { LogContext } from 'src/log-handler/enum/log-context.enum';
import { LogAction } from 'src/log-handler/enum/log-action.enum';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Sensor) private readonly sensorRepo: Repository<Sensor>,
    private readonly mqttService: MqttClientService,
    private readonly topicService: TopicService,
    private readonly redisCache: RedisService,
    private readonly logger: LogHandlerService,
  ) {}

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
  async discoverDevicesBroadcast(discoverRequest: DiscoveryRequestDto) {
    const broadcastTopic = await this.topicService.getBroadcastTopic();

    const { isBroadcast, deviceId, requestCode } = discoverRequest;

    if (requestCode !== RequestMessageCode.DISCOVERY) {
      throw new BadRequestException('Invalid request');
    }

    if (isBroadcast && !deviceId) {
      // cache the request id for validation with response id
      await this.setCache(discoverRequest);

      // Then publish message
      this.mqttService.publish(
        broadcastTopic,
        JSON.stringify(discoverRequest),
        { qos: 0, retain: false },
      );
    }

    this.logger.success(
      LogContext.MESSAGE,
      'DiscoverBroadcast',
      LogAction.REQUEST,
      'Broadcast discovery request sent successfully',
    );
  }

  async discoverDeviceUnicast(discoverRequest: DiscoveryRequestDto) {
    const { isBroadcast, deviceId, requestCode } = discoverRequest;

    if (requestCode !== RequestMessageCode.DISCOVERY) {
      throw new BadRequestException('Invalid request');
    }

    if (deviceId && !isBroadcast) {
      await this.setCache(discoverRequest);

      const sensorTopic = await this.topicService.getTopicByDeviceId(
        deviceId,
        TopicUseCase.DISCOVERY,
      );
      if (!sensorTopic.topic) {
        this.logger.fail(
          LogContext.TOPIC,
          'Discovery',
          LogAction.RETRIEVE,
          `Discovery topic for ${deviceId} is required`,
        );

        throw new ForbiddenException(
          `Discovery topic for ${deviceId} is required`,
        );
      }

      this.mqttService.publish(
        sensorTopic.topic,
        JSON.stringify(discoverRequest),
        { qos: 0, retain: false },
      );
    }
    this.logger.success(
      LogContext.MESSAGE,
      'DiscoverUnicast',
      LogAction.REQUEST,
      'Broadcast discovery request sent successfully',
    );
  }

  async getUnassignedSensor(): Promise<Sensor[]> {
    const sensors = await this.sensorRepo.find({
      where: {
        provisionState: ProvisionState.DISCOVERED,
        isDeleted: false,
      },
    });
    if (!sensors.length) {
      this.logger.success(
        LogContext.DEVICE,
        'Unassigned',
        LogAction.REQUEST,
        'No unassigend device was found',
      );
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

  public async storeSensorInDatabase(sensorMessage: DiscoveryResponseDto) {
    const { deviceId } = sensorMessage;

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
        await this.topicService.createAllTopics(deviceId);
      }

      this.logger.success(
        LogContext.DATABASE,
        'StoreSensor',
        LogAction.CREATE,
        `Device added to database`,
      );
    } catch (error) {
      this.logger.fail(
        LogContext.DATABASE,
        'StoreSensor',
        LogAction.CREATE,
        `Saving device in database failed`,
      );
    }
  }

  async getHardwareStatus(statusRequest: HardwareStatusRequestDto) {
    const { deviceId, requestCode } = statusRequest;

    if (requestCode !== RequestMessageCode.HARDWARE_METRICS) {
      throw new BadRequestException('Invalid Request');
    }

    const device = await this.sensorRepo.findOne({
      where: {
        sensorId: deviceId,
        isDeleted: false,
      },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    try {
      const { topic } = await this.topicService.createTopic(
        deviceId,
        TopicUseCase.HARDWARE_STATUS,
      );

      await this.setCache(statusRequest);

      await this.mqttService.publish(topic, JSON.stringify(statusRequest), {
        qos: 1,
        retain: false,
      });
      this.logger.success(
        LogContext.MESSAGE,
        'HardwareStatus',
        LogAction.RESPONSE,
        `Hardware_Status ${deviceId} request success`,
      );
    } catch (error) {
      this.logger.fail(
        LogContext.MESSAGE,
        'HardwareStatus',
        LogAction.RESPONSE,
        `Hardware_Status ${deviceId} request failed`,
      );
      throw new BadRequestException('Hardware status request failed');
    }
  }

  async provisionDevice(
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

    try {
      await this.validateSensorTypes(deviceId, functionality);

      this.mqttService.publish(topic, JSON.stringify(provisionData), {
        qos: 1,
        retain: false,
      });

      await this.setCache(provisionData);

      this.logger.success(
        LogContext.MESSAGE,
        'AssignDeviceFunction',
        LogAction.REQUEST,
        `Sensor ${deviceId} assignement requestede`,
      );

      return `Device with id of ${deviceId} provisioned as ${functionality}`;
    } catch (error) {
      this.logger.fail(
        LogContext.MESSAGE,
        'AssignDeviceFunction',
        LogAction.REQUEST,
        `Sensor ${deviceId} assignement request failed`,
      );
      throw new BadRequestException('Invalid assignement request');
    }
  }

  async validateSensorTypes(deviceId: string, functionality: SensorType[]) {
    const storedDevice = await this.sensorRepo.findOne({
      where: {
        sensorId: deviceId,
        isDeleted: false,
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
      this.logger.error(`Sensor ${deviceId} functionality validation failed`);

      throw new BadRequestException(
        `Device does not support the following functionalities: ${invalidSensorTypes.join(', ')}`,
      );
    }
  }

  async deleteSensor(sensorId: string) {
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
    this.logger.success(
      LogContext.MESSAGE,
      'SensorDelete',
      LogAction.REQUEST,
      `Sensor ${device.sensorId} deleted successfully`,
    );
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

    // const ackTopic = `${publishTopic}/ack`;

    await this.mqttService.publish(publishTopic, JSON.stringify(configData), {
      qos: 1,
      retain: false,
    });

    // await this.mqttService.subscribe(ackTopic, sensorId);
  }

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

  async getDeviceTelemetry(telemetry: TelemetryRequestDto) {
    const { deviceId, requestCode } = telemetry;

    if (requestCode !== RequestMessageCode.TELEMETRY_DATA) {
      throw new BadRequestException('Invalid request');
    }

    const storedDevice = await this.sensorRepo.findOne({
      where: {
        sensorId: deviceId,
        provisionState: ProvisionState.ASSIGNED,
        isDeleted: false,
      },
    });

    if (!storedDevice) {
      throw new NotFoundException(`Device not found`);
    }

    const { topic } = await this.topicService.createTopic(
      deviceId,
      TopicUseCase.TELEMETRY,
    );

    await this.setCache(TelemetryRequestDto);

    await this.mqttService.publish(topic, JSON.stringify(telemetry), {
      qos: 0,
      retain: false,
    });

    this.logger.debug(
      LogContext.TELEMETRY,
      'TelemetryRequest',
      LogAction.REQUEST,
      `Telemetry requested from ${deviceId}`,
    );
  }
}
