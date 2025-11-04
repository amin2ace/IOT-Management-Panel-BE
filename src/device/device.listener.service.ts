import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DeviceService } from './device.service';
import { DiscoveryResponseDto } from './messages/discovery-response.dto';

@Injectable()
export class DeviceListener {
  constructor(private readonly deviceService: DeviceService) {}

  @OnEvent('mqtt.message.capabilities')
  async handleDiscoveryEvent(payload: DiscoveryResponseDto) {
    const { publishTopic, deviceId: sensorId } = payload;
    console.log({ publishTopic, sensorId });

    if (!publishTopic.endsWith('/capabilities')) return;

    // const sensorMessage = await this.deviceService.mapRawPayload(payload);
    await this.deviceService.storeSensorInDatabase(payload);
  }

  @OnEvent('mqtt.message.data')
  async handleSensorDataEvent(payload: DiscoveryResponseDto) {
    const { publishTopic, deviceId: sensorId } = payload;
    console.log({ publishTopic, sensorId });

    if (!publishTopic.endsWith('/data')) return;

    // const sensorMessage = await this.deviceService.mapRawPayload(payload);
    await this.deviceService.handleSensorData(payload);
  }
}
