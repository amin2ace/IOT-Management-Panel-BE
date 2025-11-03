import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { QueryDeviceDto } from './dto/query-device.dto';
import { SensorAssignTypeDto } from './dto/sensor-assign-type.dto';
import { ControlDeviceDto } from './dto/control-device.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from './repository/device.entity';
import { In, Not, Repository } from 'typeorm';
import { MqttClientService } from 'src/mqtt-client/mqtt-client.service';
import { DeviceDiscoveryDto } from './dto/discovery-params.dto';
import { plainToInstance } from 'class-transformer';
import { SensorMessageDto } from './dto/sensor-message.dto';
import { ConnectionState } from 'src/config/enum/connection-state.enum';
import { ProvisionState } from 'src/config/enum/provision-state.enum';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device) private readonly deviceRepo: Repository<Device>,
  ) {}

  private readonly logger = new Logger(DeviceService.name, {
    timestamp: true,
  });

  async getDevices(query: QueryDeviceDto): Promise<Device[]> {
    const { clientId, state, assignedType } = query;

    // Build dynamic query
    const qb = this.deviceRepo.createQueryBuilder('device');

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

  async discoverDevices(params: DeviceDiscoveryDto) {}

  async getUnassignedDevices(): Promise<Device[]> {
    const devices = await this.deviceRepo.find({
      where: {
        provisionState: ProvisionState.DISCOVERED,
        isDeleted: false,
      },
    });
    return devices;
  }

  async mapRawPayload(rawPayload: any): Promise<SensorMessageDto> {
    // Map raw payload to DTO
    const payload = plainToInstance(SensorMessageDto, {
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
    sensorMessage: SensorMessageDto,
  ): Promise<string> {
    const {
      capabilities,
      connectedTime,
      deviceHardware,
      firmware,
      ip,
      mac,
      connectionState,
      sensorId,
      broker,
      location,
      protocol,
      publishTopic,
    } = sensorMessage;

    const existingDevice = await this.deviceRepo.findOne({
      where: { sensorId },
    });

    try {
      if (existingDevice?.isDeleted) {
        await this.deviceRepo.update({ sensorId }, { isDeleted: false });
      }

      if (!existingDevice) {
        const deviceRecord = this.deviceRepo.create({
          sensorId,
          capabilities,
          deviceHardware,
          firmware,
          ip,
          mac,
          connectionState,
          provisionState: ProvisionState.DISCOVERED,
          connectedTime,
          isActuator: false,
          isDeleted: false,
          protocol,
          broker,
          location,
          publishTopic,
        });
        await this.deviceRepo.save(deviceRecord);
      }

      return 'Device saved to database';
    } catch (error) {
      console.error('Error saving device to database:', error.message);
      return 'Error saving device to database';
    }
  }

  async getDeviceById(sensorId: string): Promise<Device> {
    const device = await this.deviceRepo.findOne({
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
    provisionData: SensorAssignTypeDto,
  ): Promise<string> {
    const { assignedType } = provisionData;
    const device = await this.deviceRepo.findOne({
      where: {
        isDeleted: false,
        sensorId,
      },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${sensorId} not found`);
    }

    device.assignedType = assignedType;
    device.provisionState = ProvisionState.ASSIGNED;

    await this.deviceRepo.save(device);
    return `Device with id of ${sensorId} provisioned as ${assignedType}`;
  }

  async deleteDevice(sensorId: string): Promise<string> {
    const device = await this.deviceRepo.findOne({
      where: {
        sensorId,
        isDeleted: false,
      },
    });

    if (!device) {
      throw new NotFoundException(`Device with ID ${sensorId} not found`);
    }

    device.isDeleted = true;
    await this.deviceRepo.save(device);
    return `Device with ID ${sensorId} marked as deleted`;
  }

  reconfigureDevice(id: string) {
    return { message: 'Reconfigure sent', id };
  }

  getLiveStatus(id: string) {
    return { message: 'Live status', id };
  }

  getDeviceHistory(id: string) {
    return { message: 'History data', id };
  }

  controlDevice(id: string, data: ControlDeviceDto) {
    return { message: 'Control command', id, data };
  }

  getDeviceStatus(id: string) {
    return { message: 'Status for device', id };
  }
}
