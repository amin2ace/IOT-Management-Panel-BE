import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
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
  DiscoveryBroadcastRequestDto,
  DiscoveryResponseDto,
  DiscoveryUnicastRequestDto,
  RequestMessageCode,
  SensorConfigRequestDto,
  SensorFunctionalityRequestDto,
} from './messages';
import { TopicService } from 'src/topic/topic.service';
import { TopicUseCase } from 'src/topic/enum/topic-usecase.enum';
import { RedisService } from 'src/redis/redis.service';
import { DeviceCapabilities } from 'src/config/enum/sensor-type.enum';
import { TelemetryRequestDto } from './messages/publish/telemetry.request.dto';
import { HardwareStatusRequestDto } from './messages/publish/hardware-status.request';
import { GetAllDevicesResponseDto } from './dto/get-all-devices.response.dto';
import { SensorResponseDto } from './dto/sensor-response.dto';
import { ConfigService } from '@nestjs/config';
import { QuerySensorDto } from './dto/query-sensor.dto';

@Injectable()
export class DeviceService {
  private readonly ttl: number;
  constructor(
    @InjectRepository(Sensor) private readonly sensorRepo: Repository<Sensor>,
    private readonly mqttService: MqttClientService,
    private readonly topicService: TopicService,
    private readonly redisCache: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.ttl = this.configService.getOrThrow<number>('REDIS_TTL');
  }

  private readonly logger = new Logger(DeviceService.name, { timestamp: true });
  async getSensors(query: QueryDeviceDto): Promise<GetAllDevicesResponseDto> {
    const { deviceId, provisionState, functionality } = query;

    // Build dynamic filter object: Mongo db doesn't support query builder
    const filter: any = {};

    if (deviceId) filter.deviceId = deviceId;
    if (provisionState) filter.provisionState = provisionState;
    if (functionality) filter.functionality = functionality;

    const devices = await this.sensorRepo.find({
      where: filter,
    });

    return {
      data: devices,
    };
  }

  async getSensor(deviceId: string): Promise<SensorResponseDto> {
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

  async discoverDevicesBroadcast(
    discoverRequest: DiscoveryBroadcastRequestDto,
  ) {
    const broadcastTopic = await this.topicService.getBroadcastTopic();

    const { isBroadcast, requestCode } = discoverRequest;

    if (requestCode !== RequestMessageCode.DISCOVERY) {
      throw new BadRequestException('Invalid request');
    }

    if (isBroadcast) {
      // cache the request id for validation with response id
      await this.setCache(discoverRequest);

      const topic = await this.topicService.storeTopic(
        'Mqtt_Broker',
        `${broadcastTopic.topic}/${TopicUseCase.DISCOVERY}`,
        TopicUseCase.BROADCAST,
      );
      // console.log(topic);

      // Then publish message
      // this.logger.log({ broadcastTopic });
      await this.mqttService.publish(
        topic.topic,
        JSON.stringify(discoverRequest),
        {
          qos: 0,
          retain: false,
        },
      );

      await this.mqttService.subscribe(topic.topic);
      this.logger.debug(`Discovery broadcast sent successfully`);
    }
  }

  async discoverDeviceUnicast(discoverRequest: DiscoveryUnicastRequestDto) {
    const { isBroadcast, deviceId, requestCode } = discoverRequest;
    const broadcastTopic = await this.topicService.getBroadcastTopic();

    if (requestCode !== RequestMessageCode.DISCOVERY) {
      throw new BadRequestException('Invalid request');
    }

    if (deviceId && !isBroadcast) {
      await this.setCache(discoverRequest);

      const { topic } = await this.topicService.storeTopic(
        'Mqtt_Broker',
        `${broadcastTopic}/${TopicUseCase.DISCOVERY}`,
        TopicUseCase.BROADCAST,
      );

      this.mqttService.publish(topic, JSON.stringify(discoverRequest), {
        qos: 0,
        retain: false,
      });
      await this.mqttService.subscribe(topic);
    }
    this.logger.debug('Broadcast discovery request sent successfully');
  }

  async getUnassignedSensor(): Promise<QuerySensorDto[]> {
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

  async getHardwareStatus(statusRequest: HardwareStatusRequestDto) {
    const { deviceId, requestCode } = statusRequest;

    if (requestCode !== RequestMessageCode.HARDWARE_METRICS) {
      throw new BadRequestException('Invalid Request');
    }

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
      const { topic } = await this.topicService.createTopic(
        deviceId,
        TopicUseCase.HARDWARE_STATUS,
      );

      await this.setCache(statusRequest);

      await this.mqttService.publish(topic, JSON.stringify(statusRequest), {
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
    provisionData: SensorFunctionalityRequestDto,
  ): Promise<string> {
    const { deviceId, functionality, requestCode } = provisionData;

    if (requestCode !== RequestMessageCode.ASSIGN_DEVICE_FUNCTION) {
      throw new BadRequestException('Invalid Request');
    }

    const { topic } = await this.topicService.getDeviceTopicByUseCase(
      deviceId,
      TopicUseCase.ASSIGN_DEVICE_FUNCTION,
    );

    // try {
    await this.validateSensorTypes(deviceId, functionality);

    await this.setCache(provisionData);

    await this.sensorRepo.update(
      { deviceId },
      {
        assignedFunctionality: functionality,
        provisionState: ProvisionState.ASSIGNED,
      },
    );

    this.mqttService.publish(topic, JSON.stringify(provisionData), {
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

  async reconfigureDevice(configData: SensorConfigRequestDto) {
    const { deviceId, requestCode } = configData;
    if (requestCode != RequestMessageCode.SENSOR_CONFIGURATION) return;

    const storedDevice = await this.sensorRepo.findOne({
      where: {
        deviceId: deviceId,
        isDeleted: false,
      },
    });

    if (!storedDevice) {
      throw new NotFoundException(`Device with id ${deviceId} not found`);
    }

    const { topic } = await this.topicService.getDeviceTopicByUseCase(
      deviceId,
      TopicUseCase.SENSOR_CONFIGURATION,
    );

    await this.mqttService.publish(topic, JSON.stringify(configData), {
      qos: 1,
      retain: false,
    });
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

  async getDeviceTelemetry(telemetry: TelemetryRequestDto) {
    const { deviceId, requestCode } = telemetry;

    if (requestCode !== RequestMessageCode.TELEMETRY_DATA) {
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

    await this.setCache(TelemetryRequestDto);

    await this.mqttService.publish(topic, JSON.stringify(telemetry), {
      qos: 0,
      retain: false,
    });

    this.logger.debug(`Telemetry requested from ${deviceId}`);
  }
}
