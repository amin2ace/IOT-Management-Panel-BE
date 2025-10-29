import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MqttManagementService } from './mqtt-management.service';
import { MqttPublishDto } from './dto/mqtt-publish.dto';
import { MqttSubscribeDto } from './dto/mqtt-subscribe.dto';

@ApiTags('MQTT Management')
@Controller('mqtt')
export class MqttManagementController {
  constructor(private readonly mqttManagementService: MqttManagementService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get MQTT connection status' })
  @ApiResponse({ status: 200, description: 'Returns MQTT connection details' })
  async getStatus() {
    return this.mqttManagementService.getConnectionStatus();
  }

  @Post('publish')
  @ApiOperation({ summary: 'Publish message to MQTT topic' })
  @ApiResponse({ status: 201, description: 'Message published successfully' })
  async publish(@Body() publishDto: MqttPublishDto) {
    return this.mqttManagementService.publishMessage(
      publishDto.topic,
      publishDto.message,
      publishDto.qos,
      publishDto.retain,
    );
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to MQTT topic' })
  @ApiResponse({ status: 201, description: 'Subscribed to topic successfully' })
  async subscribe(@Body() subscribeDto: MqttSubscribeDto) {
    return this.mqttManagementService.subscribeToTopic(
      subscribeDto.topic,
      subscribeDto.qos,
    );
  }

  @Delete('unsubscribe/:topic')
  @ApiOperation({ summary: 'Unsubscribe from MQTT topic' })
  @ApiResponse({
    status: 200,
    description: 'Unsubscribed from topic successfully',
  })
  async unsubscribe(@Param('topic') topic: string) {
    return this.mqttManagementService.unsubscribeFromTopic(topic);
  }

  @Get('topics')
  @ApiOperation({ summary: 'Get all subscribed topics' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of subscribed topics',
  })
  async getSubscribedTopics() {
    return this.mqttManagementService.getSubscribedTopics();
  }

  @Post('reconnect')
  @ApiOperation({ summary: 'Reconnect to MQTT broker' })
  @ApiResponse({ status: 200, description: 'Reconnection initiated' })
  async reconnect() {
    return this.mqttManagementService.reconnect();
  }
}
