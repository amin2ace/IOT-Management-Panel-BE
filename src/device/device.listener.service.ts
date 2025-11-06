import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DeviceService } from './device.service';
import { DiscoveryResponseDto } from './messages';

@Injectable()
export class DeviceListener {
  constructor(private readonly deviceService: DeviceService) {}

  // Listen for MQTT discovery topic like: "sensors/+/discovery"
  @OnEvent('mqtt.message.discovery')
  async handleDiscoveryEvent(topic: string, payload: DiscoveryResponseDto) {
    const { topicPrefix, deviceId: sensorId } = payload;
    console.log({ topicPrefix, sensorId });

    if (!topic.endsWith('/discovery')) return;

    await this.deviceService.storeSensorInDatabase(payload);
  }

  @OnEvent('mqtt.message.data')
  async handleSensorDataEvent(payload: DiscoveryResponseDto) {
    const { topicPrefix, deviceId: sensorId } = payload;
    console.log({ topicPrefix, sensorId });

    if (!topicPrefix.endsWith('/data')) return;

    // const sensorMessage = await this.deviceService.mapRawPayload(payload);
    await this.deviceService.handleSensorData(payload);
  }
}
