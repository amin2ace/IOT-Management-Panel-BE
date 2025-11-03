import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryDeviceDto } from './dto/query-device.dto';
import { AssignDeviceDto } from './dto/assign-device.dto';
import { ControlDeviceDto } from './dto/control-device.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from './repository/device.entity';
import { In, Not, Repository } from 'typeorm';
import { MqttClientService } from 'src/mqtt-management/mqtt-client.service';
import { DeviceDiscoveryDto } from './dto/discovery-params.dto';
import { plainToInstance } from 'class-transformer';
import { SensorMessageDto } from './dto/sensor-message.dto';
import { ConnectionState } from 'src/config/enum/connection-state.enum';
import { ProvisionState } from 'src/config/enum/device-state.enum';

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device) private readonly deviceRepo: Repository<Device>,
    private readonly mqttService: MqttClientService,
  ) {}

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

  async discoverDevices(params: DeviceDiscoveryDto) {
    const { mqttBrokerUrl, topicWildCard } = params;

    await this.mqttService.initConnection(mqttBrokerUrl);
    // Subscribe to MQTT topics ending with "compatibility"
    await this.mqttService.subscribe(
      topicWildCard || 'sensors/+/+/compatibility',
      0,
      async (topic, message) => {
        try {
          const payload = JSON.parse(message.toString());

          const sensorMessage = await this.mapRawPayload(payload);
          const { sensorId, publishTopic } = sensorMessage;

          // Check if device already exists
          let device = await this.deviceRepo.findOneBy({
            sensorId,
            isDeleted: false,
          });

          if (!device) {
            await this.storeDeviceInDatabase(sensorMessage);
            console.log(`Device saved/updated: ${publishTopic}`);
          }
        } catch (err) {
          console.error(
            `Failed to process MQTT message from topic: ${topic}`,
            err.stack,
          );
        }
      },
    );
  }
  async getUnassignedDevices(): Promise<Device[]> {
    const devices = await this.deviceRepo.find({
      where: {
        provisionState: ProvisionState.DISCOVERED,
        assignedType: 'null',
        isDeleted: false,
      },
    });
    return devices;
  }

  async mapRawPayload(rawPayload: any): Promise<SensorMessageDto> {
    // Map raw payload to DTO
    const payload = plainToInstance(SensorMessageDto, {
      clientId: rawPayload.clientId || 'unknown',
      macAddress: rawPayload.macAddress || '00:00:00:00:00:00',
      ipAddress: rawPayload.ipAddress || '0.0.0.0',
      firmwareVersion: rawPayload.firmwareVersion || 'unknown',
      deviceType: rawPayload.deviceType || 'unknown',
      capabilities: rawPayload.capabilities || [], // array of SensorType
      connectTime: rawPayload.connectTime || Date.now(),
      state: rawPayload.state || ConnectionState.OFFLINE,
      location: rawPayload.location,
      protocol: rawPayload.protocol || 'MQTT',
      broker: rawPayload.broker,
      additionalInfo: rawPayload.additionalInfo,
    });

    return payload;
  }

  private async storeDeviceInDatabase(
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
      protocol,
      broker,
      location,
      publishTopic,
    });

    try {
      await this.deviceRepo.save(deviceRecord);
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
    provisionData: AssignDeviceDto,
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
