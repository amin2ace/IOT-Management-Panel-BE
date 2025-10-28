import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MqttClientService } from './mqtt-client.service';
import { MqttPublishDto } from './dto/mqtt-publish.dto';
import { MqttSubscribeDto } from './dto/mqtt-subscribe.dto';

@ApiTags('MQTT')
@Controller('/mqtt')
export class MqttManagerController {
  constructor(private readonly mqttClient: MqttClientService) {}

  @Get('/status')
  getStatus() {
    return this.mqttClient.getConnectionStatus();
  }

  @Post('/publish')
  publishMessage(@Body() body: MqttPublishDto) {
    const success = this.mqttClient.publish(body.topic, body.message);
    return { success };
  }

  @Post('/subscribe')
  subscribeToTopic(@Body() body: MqttSubscribeDto) {
    this.mqttClient.subscribe(body.topic);
    return { success: true };
  }
}
