import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DeviceService } from './device.service';
import { DiscoveryResponseDto } from './messages/discovery.response.dto';

@Injectable()
export class DeviceListener {
  constructor(private readonly deviceService: DeviceService) {}

  // Listen for MQTT discovery topic like: "sensors/+/discovery"
  @OnEvent('mqtt.message.discovery')
  async handleDiscoveryEvent(payload: DiscoveryResponseDto) {
    const { topicPrefix: publishTopic, deviceId: sensorId } = payload;
    console.log({ publishTopic, sensorId });

    if (!publishTopic.endsWith('/discovery')) return;

    await this.deviceService.storeSensorInDatabase(payload);
  }

  @OnEvent('mqtt.message.data')
  async handleSensorDataEvent(payload: DiscoveryResponseDto) {
    const { topicPrefix: publishTopic, deviceId: sensorId } = payload;
    console.log({ publishTopic, sensorId });

    if (!publishTopic.endsWith('/data')) return;

    // const sensorMessage = await this.deviceService.mapRawPayload(payload);
    await this.deviceService.handleSensorData(payload);
  }
}
