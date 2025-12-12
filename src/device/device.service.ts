import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { QueryDeviceDto } from './dto/query-device.dto';
import { ControlDeviceDto } from './dto/control-device.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MqttClientService } from 'src/mqtt-client/mqtt-client.service';
import { ProvisionState } from 'src/config/enum/provision-state.enum';
import {
  RequestMessageCode,
  PublishSensorFunctionalityDto,
} from './dto/messages';
import { TopicService } from 'src/topic/topic.service';
import { TopicUseCase } from 'src/topic/enum/topic-usecase.enum';
import { RedisService } from 'src/redis/redis.service';
import { DeviceCapabilities } from 'src/config/enum/sensor-type.enum';
import { PublishTelemetryDto } from './dto/messages/Publish-telemetry.dto';
import { publishHardwareStatusDto } from './dto/messages/publish-hardware-status';
import { GetAllDevicesDto } from './dto/get-all-devices.dto';
import { SensorDto } from './dto/sensor.dto';
import { ConfigService } from '@nestjs/config';
import { Sensor } from './repository/sensor.entity';
import { SensorConfig } from './repository/sensor-config.entity';
import { SensorConfigDto } from './dto/sensor-config.dto';
import { v4 as uuid } from 'uuid';
import { User } from '@/users/entities/user.entity';
import { PublishDiscoveryBroadcastDto } from './dto/messages/publish-discovery-broadcast.dto';
import { PublishDiscoveryUnicastDto } from './dto/messages/publish-discovery-unicast.dto';
@Injectable()
export class DeviceService {
  private readonly ttl: number;
  constructor(
    @InjectRepository(Sensor)
    private readonly sensorRepo: Repository<Sensor>,
    private readonly mqttService: MqttClientService,
    private readonly topicService: TopicService,
    private readonly redisCache: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.ttl = this.configService.getOrThrow<number>('REDIS_TTL');
  }

  private readonly logger = new Logger(DeviceService.name, { timestamp: true });

  async getAllSensors(): Promise<GetAllDevicesDto> {
    const devices = await this.sensorRepo.find({
      where: {
        isDeleted: false,
      },
      relations: {
        configuration: true,
      },
    });

    const result: GetAllDevicesDto = {
      data: devices,
      total: devices.length,
    };

    return result;
  }

  async querySensors(query: QueryDeviceDto): Promise<GetAllDevicesDto> {
    const { deviceId, provisionState, functionality } = query;

    // Build dynamic filter object: Mongo db doesn't support query builder
    const filter: any = {};

    if (deviceId) filter.deviceId = deviceId;
    if (provisionState) filter.provisionState = provisionState;
    if (functionality) filter.assignedFunctionality = functionality;

    const devices = await this.sensorRepo.find({
      where: filter,
    });

    return {
      data: devices,
      total: devices.length,
    };
  }

  async getSingleSensor(deviceId: string): Promise<SensorDto> {
    const device = await this.sensorRepo.findOne({
      where: {
        deviceId,
        isDeleted: false,
      },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    return device;
  }

  private async setCache(dto: any) {
    const { deviceId, requestId, requestCode, userId } = dto;

    const key = `pending:${requestId}`;
    const Value = JSON.stringify({
      requestCode,
      userId,
      requestId,
    });

    this.redisCache.setex(key, Value, this.ttl);
  }

  async discoverDevicesBroadcast(userId: string): Promise<void> {
    const broadcastTopic = await this.topicService.getBroadcastTopic();

    const payload: PublishDiscoveryBroadcastDto = {
      isBroadcast: true,
      userId: userId,
      requestId: uuid(),
      requestCode: RequestMessageCode.REQUEST_DISCOVERY,
      timestamp: Date.now(),
    };
    // cache the request id for validation with response id
    await this.setCache(payload);

    const topic = await this.topicService.storeTopic(
      'Mqtt_Broker',
      `${broadcastTopic.topic}/${TopicUseCase.DISCOVERY}`,
      TopicUseCase.BROADCAST,
    );

    // Then publish message
    await this.mqttService.publish(topic.topic, JSON.stringify(payload), {
      qos: 0,
      retain: false,
    });

    await this.mqttService.subscribe(topic.topic);
    this.logger.debug(`Discovery broadcast sent successfully`);
  }

  async discoverDeviceUnicast(userId: string, deviceId: string) {
    const broadcastTopic = await this.topicService.getBroadcastTopic();

    const payload: PublishDiscoveryUnicastDto = {
      deviceId,
      userId: userId,
      isBroadcast: false,
      requestCode: RequestMessageCode.REQUEST_DISCOVERY,
      requestId: uuid(),
      timestamp: Date.now(),
    };

    await this.setCache(payload);

    const { topic } = await this.topicService.storeTopic(
      'Mqtt_Broker',
      `${broadcastTopic}/${TopicUseCase.DISCOVERY}`,
      TopicUseCase.BROADCAST,
    );

    this.mqttService.publish(topic, JSON.stringify(payload), {
      qos: 0,
      retain: false,
    });
    await this.mqttService.subscribe(topic);

    this.logger.debug('Broadcast discovery request sent successfully');
  }

  async getUnassignedSensor(): Promise<Sensor[]> {
    const sensors = await this.sensorRepo.find({
      where: {
        provisionState: ProvisionState.DISCOVERED,
        isDeleted: false,
      },
    });
    if (!sensors.length) {
      this.logger.debug('No unassigend device was found');
      throw new NotFoundException('No unassigned devices found');
    }

    return sensors;
  }

  async getHardwareStatus(currentUser: User, deviceId: string) {
    const device = await this.sensorRepo.findOne({
      where: {
        deviceId: deviceId,
        isDeleted: false,
      },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    try {
      const payload: publishHardwareStatusDto = {
        deviceId: device.deviceId,
        userId: currentUser.userId,
        requestId: uuid(),
        requestCode: RequestMessageCode.REQUEST_HARDWARE_METRICS,
        timestamp: Date.now(),
      };

      const { topic } = await this.topicService.createTopic(
        deviceId,
        TopicUseCase.HARDWARE_STATUS,
      );

      await this.setCache(payload);

      await this.mqttService.publish(topic, JSON.stringify(payload), {
        qos: 1,
        retain: false,
      });

      this.logger.debug(`Hardware_Status ${deviceId} request success`);
    } catch (error) {
      this.logger.error(`Hardware_Status ${deviceId} request failed`);
      throw new BadRequestException('Hardware status request failed');
    }
  }

  async AssignDeviceFunction(
    currentUser: User,
    provisionData: PublishSensorFunctionalityDto,
  ): Promise<string> {
    const { deviceId, functionality, requestCode } = provisionData;

    if (requestCode !== RequestMessageCode.REQUEST_ASSIGN_DEVICE_FUNCTION) {
      throw new BadRequestException('Invalid Request');
    }

    const { topic } = await this.topicService.getDeviceTopicByUseCase(
      deviceId,
      TopicUseCase.ASSIGN_DEVICE_FUNCTION,
    );

    await this.validateSensorTypes(deviceId, functionality);

    const payload: PublishSensorFunctionalityDto = {
      ...provisionData,
      userId: currentUser.userId,
      requestCode: RequestMessageCode.REQUEST_ASSIGN_DEVICE_FUNCTION,
      requestId: uuid(),
    };
    // try {

    await this.setCache(payload);

    await this.sensorRepo.update(
      { deviceId },
      {
        assignedFunctionality: functionality,
        provisionState: ProvisionState.ASSIGNED,
      },
    );

    this.mqttService.publish(topic, JSON.stringify(payload), {
      qos: 1,
      retain: false,
    });

    this.logger.debug(`Sensor ${deviceId} assignement requested`);

    this.logger.log(
      `Device with id of ${deviceId} provisioned as ${functionality}`,
    );

    return `Device with id of ${deviceId} provisioned as ${functionality}`;
  }

  async validateSensorTypes(
    deviceId: string,
    functionality: DeviceCapabilities[],
  ) {
    const storedDevice = await this.sensorRepo.findOne({
      where: {
        deviceId: deviceId,
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
      this.logger.error(
        `Sensor ${deviceId} functionality validation failed for device`,
      );
      throw new UnauthorizedException(
        `${deviceId} functionality validation failed`,
      );
    }
  }

  async deleteSensor(deviceId: string) {
    const device = await this.sensorRepo.findOne({
      where: {
        deviceId: deviceId,
        isDeleted: false,
      },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    await this.sensorRepo.update({ deviceId }, { isDeleted: true });
    this.logger.log(`Sensor ${device.deviceId} deleted successfully`);
  }

  async getDeviceConfiguration(deviceId: string): Promise<SensorConfig> {
    const storedDevice = await this.sensorRepo.findOne({
      where: {
        deviceId,
        isDeleted: false,
      },
    });

    if (!storedDevice) {
      throw new NotFoundException('Device not Found');
    }
    const config = storedDevice.configuration;

    return config;
  }

  async setDeviceConfiguration(configData: SensorConfigDto) {
    const { deviceId } = configData;

    const storedDevice = await this.sensorRepo.findOne({
      where: {
        deviceId: deviceId,
        isDeleted: false,
      },
    });

    if (!storedDevice) {
      throw new NotFoundException(`Device with id ${deviceId} not found`);
    }
    // TODO: User validation using userid and add it to publish data

    const { topic } = await this.topicService.getDeviceTopicByUseCase(
      deviceId,
      TopicUseCase.SET_SENSOR_CONFIGURATION,
    );

    await this.mqttService.publish(topic, JSON.stringify(configData), {
      qos: 1,
      retain: false,
    });

    await this.sensorRepo.update({ deviceId }, { configuration: configData });
  }

  getDeviceHistory(id: string) {
    return { message: 'History data', id };
  }

  controlDevice(id: string, data: ControlDeviceDto) {
    return { message: 'Control command', id, data };
  }

  async getDeviceStatus(deviceId: string) {
    const sensor = await this.sensorRepo.findOne({
      where: {
        deviceId,
      },
    });
    if (!sensor) {
      throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    return {
      id: sensor.deviceId,
      state: sensor.provisionState,
      error: sensor.hasError,
      available: sensor.isDeleted ? false : true,
      connection: sensor.connectionState,
    };
  }

  async getDeviceTelemetry(telemetry: PublishTelemetryDto) {
    const { deviceId, requestCode } = telemetry;

    if (requestCode !== RequestMessageCode.REQUEST_TELEMETRY_DATA) {
      throw new BadRequestException('Invalid request');
    }

    const storedDevice = await this.sensorRepo.findOne({
      where: {
        deviceId: deviceId,
        provisionState: ProvisionState.ASSIGNED,
        isDeleted: false,
      },
    });

    if (!storedDevice) {
      throw new NotFoundException(`Device not found`);
    }

    const { topic } = await this.topicService.getDeviceTopicByUseCase(
      deviceId,
      TopicUseCase.TELEMETRY,
    );

    await this.setCache(PublishTelemetryDto);

    await this.mqttService.publish(topic, JSON.stringify(telemetry), {
      qos: 0,
      retain: false,
    });

    this.logger.debug(`Telemetry requested from ${deviceId}`);
  }
}
