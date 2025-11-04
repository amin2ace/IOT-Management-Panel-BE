import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { QueryDeviceDto } from './dto/query-device.dto';
import { SensorFunctionAssignDto } from './dto/sensor-assign-type.dto';
import { ControlDeviceDto } from './dto/control-device.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Sensor } from './repository/sensor.entity';
import { Repository } from 'typeorm';
import { MqttClientService } from 'src/mqtt-client/mqtt-client.service';
import { plainToInstance } from 'class-transformer';
import { DiscoveryResponseDto } from './messages/discovery.response.dto';
import { ProvisionState } from 'src/config/enum/provision-state.enum';
import { DiscoveryRequestDto } from './messages/discovery.request.dto';
import { buildTopic } from 'src/config/topic-bulder';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Sensor) private readonly sensorRepo: Repository<Sensor>,
    private readonly mqttClientService: MqttClientService,
  ) {}

  private readonly logger = new Logger(DeviceService.name, {
    timestamp: true,
  });

  async getSensors(query: QueryDeviceDto): Promise<Sensor[]> {
    const { clientId, state, assignedType } = query;

    // Build dynamic query
    const qb = this.sensorRepo.createQueryBuilder('device');

    if (state) {
      qb.andWhere('device.state = :state', { state });
    }
    if (assignedType) {
      qb.andWhere('device.type = :type', { assignedType });
    }
    if (clientId) {
      qb.andWhere('device.clientId = :clientId', { clientId });
    }

    return await qb.getMany();
  }

  async discoverDevices(discoverRequest: DiscoveryRequestDto) {
    const { isBroadcast, deviceId } = discoverRequest;

    if (isBroadcast && !deviceId) {
      this.mqttClientService.publish(
        buildTopic.discoverBroadcast(),
        JSON.stringify(discoverRequest),
        { qos: 0, retain: false },
      );
      return { message: 'Discovery request broadcasted' };
    }

    if (deviceId && !isBroadcast) {
      this.mqttClientService.publish(
        buildTopic.discoverUnicast(deviceId),
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
    const { deviceId: sensorId } = sensorMessage;

    const existingDevice = await this.sensorRepo.findOne({
      where: { sensorId },
    });

    try {
      if (existingDevice?.isDeleted) {
        await this.sensorRepo.update({ sensorId }, { isDeleted: false });
      }

      if (!existingDevice) {
        const deviceRecord = this.sensorRepo.create({
          ...sensorMessage,
          provisionState: ProvisionState.DISCOVERED,
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
    provisionData: SensorFunctionAssignDto,
  ): Promise<string> {
    const { assignedType } = provisionData;
    const device = await this.sensorRepo.findOne({
      where: {
        isDeleted: false,
        sensorId,
      },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${sensorId} not found`);
    }

    device.assignedFunctionality = assignedType;
    device.provisionState = ProvisionState.ASSIGNED;

    await this.sensorRepo.save(device);
    return `Device with id of ${sensorId} provisioned as ${assignedType}`;
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

    device.isDeleted = true;
    await this.sensorRepo.save(device);
    return `Device with ID ${sensorId} marked as deleted`;
  }

  reconfigureDevice(id: string) {
    return { message: 'Reconfigure sent', id };
  }

  async getLiveStatus(sensorId: string) {
    const sensor = await this.sensorRepo.findOne({
      where: {
        sensorId,
      },
    });
    if (!sensor) {
      throw new NotFoundException(`Device with ID ${sensorId} not found`);
    }

    return { status: sensor.connectionState };
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

  handleSensorData(payload: DiscoveryResponseDto) {
    throw new Error('Method not implemented.');
  }
}
