import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DeviceService } from './device.service';
import { SensorMessageDto } from './dto/sensor-message.dto';

@Injectable()
export class DeviceListener {
  constructor(private readonly deviceService: DeviceService) {}

  @OnEvent('mqtt.message')
  async handleDiscoveryEvent(payload: SensorMessageDto) {
    const { publishTopic, sensorId } = payload;
    console.log({ publishTopic, sensorId });

    if (!publishTopic.endsWith('/capabilities')) return;

    // const sensorMessage = await this.deviceService.mapRawPayload(payload);
    await this.deviceService.storeSensorInDatabase(payload);
  }
}
