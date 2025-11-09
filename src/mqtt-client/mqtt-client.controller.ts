import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MqttPublishDto } from './dto/mqtt-publish.dto';
import { MqttSubscribeDto } from './dto/mqtt-subscribe.dto';
import { MqttClientService } from './mqtt-client.service';

@ApiTags('MQTT Management')
@Controller('mqtt')
export class MqttManagementController {
  constructor(private readonly mqttClientService: MqttClientService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get MQTT connection status' })
  @ApiResponse({ status: 200, description: 'Returns MQTT connection details' })
  async getStatus() {
    return this.mqttClientService.getConnectionStatus();
  }

  @Post('publish')
  @ApiOperation({ summary: 'Publish message to MQTT topic' })
  @ApiResponse({ status: 201, description: 'Message published successfully' })
  async publish(@Body() publishDto: MqttPublishDto) {
    return this.mqttClientService.publish(
      publishDto.topic,
      publishDto.message,
      { qos: publishDto.qos, retain: publishDto.retain },
    );
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to MQTT topic' })
  @ApiResponse({ status: 201, description: 'Subscribed to topic successfully' })
  async subscribe(@Body() subscribeDto: MqttSubscribeDto) {
    return this.mqttClientService.subscribe(subscribeDto.topic);
  }

  @Delete('unsubscribe/:topic')
  @ApiOperation({ summary: 'Unsubscribe from MQTT topic' })
  @ApiResponse({
    status: 200,
    description: 'Unsubscribed from topic successfully',
  })
  async unsubscribe(@Param('topic') topic: string) {
    return this.mqttClientService.unsubscribe(topic);
  }

  @Post('reconnect')
  @ApiOperation({ summary: 'Reconnect to MQTT broker' })
  @ApiResponse({ status: 200, description: 'Reconnection initiated' })
  async reconnect() {
    return this.mqttClientService.reconnect();
  }
}
