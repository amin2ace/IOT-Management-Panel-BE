import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MqttClientService } from './mqtt-client.service';
import { MqttPublishDto } from './dto/mqtt-publish.dto';
import { MqttSubscribeDto } from './dto/mqtt-subscribe.dto';
import { MqttConfigDto } from './dto/mqtt-config.dto';

/**
 * MQTT Management Controller
 * @description Provides REST API endpoints for MQTT operations including
 * publishing messages, subscribing to topics, managing subscriptions,
 * and monitoring MQTT connection status
 */
@ApiTags('MQTT')
@Controller('mqtt')
export class MqttManagementController {
  constructor(private readonly mqttClientService: MqttClientService) {}

  @Get('config')
  @ApiOperation({
    summary: 'Get current MQTT configuration',
    description:
      'Retrieves the current MQTT broker connection configuration settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the current MQTT configuration',
    schema: {
      example: {
        host: 'localhost',
        port: 1883,
        protocol: 'mqtt',
        clientId: 'iot-panel-client',
        keepalive: 60,
        ssl: false,
        clean: true,
        autoReconnect: true,
        maxReconnectAttempts: 10,
        connectTimeout: 10000,
        reconnectPeriod: 5000,
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Failed to retrieve configuration',
  })
  async getConfig() {
    return this.mqttClientService.getConfiguration();
  }

  @Put('config')
  @ApiOperation({
    summary: 'Update MQTT configuration',
    description:
      'Updates the MQTT broker connection configuration. Connection will be re-established with new settings.',
  })
  @ApiResponse({
    status: 200,
    description: 'MQTT configuration updated successfully',
    schema: {
      example: {
        message: 'Configuration updated successfully',
        config: {
          host: 'localhost',
          port: 1883,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid configuration parameters',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Failed to update configuration',
  })
  async updateConfig(@Body() configDto: MqttConfigDto) {
    await this.mqttClientService.updateConfiguration(configDto);
    return {
      message: 'Configuration updated successfully',
      config: await this.mqttClientService.getConfiguration(),
    };
  }

  @Post('config/validate')
  @ApiOperation({
    summary: 'Validate MQTT configuration',
    description:
      'Validates the provided MQTT configuration without applying changes',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuration is valid',
    schema: {
      example: {
        valid: true,
        message: 'Configuration is valid',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Configuration validation failed',
    schema: {
      example: {
        valid: false,
        errors: ['Host is required', 'Port must be between 1 and 65535'],
      },
    },
  })
  async validateConfig(@Body() configDto: MqttConfigDto) {
    const validation =
      await this.mqttClientService.validateConfiguration(configDto);
    return validation;
  }

  @Post('config/test-connection')
  @ApiOperation({
    summary: 'Test MQTT connection',
    description:
      'Tests the connection to the MQTT broker with the provided configuration without establishing permanent connection',
  })
  @ApiResponse({
    status: 200,
    description: 'Connection test successful',
    schema: {
      example: {
        success: true,
        message: 'Successfully connected to MQTT broker',
        brokerInfo: {
          version: '4.0.0',
          brokerName: 'Mosquitto',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Connection test failed - Invalid configuration',
  })
  @ApiResponse({
    status: 503,
    description: 'Service unavailable - Cannot connect to broker',
  })
  async testConnection(@Body() configDto: MqttConfigDto) {
    return this.mqttClientService.testConnection(configDto);
  }

  @Post('connect/:broker')
  @ApiOperation({
    summary: 'Connect to MQTT broker',
    description:
      'Establishes a connection to the MQTT broker using configured settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully connected to the MQTT broker',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Failed to connect to MQTT broker',
  })
  @ApiParam({
    name: 'broker',
    description: 'MQTT broker URL to connect to',
    example: 'mqtt://localhost:1883',
  })
  async connect(@Param('broker') brokerUrl: string) {
    return this.mqttClientService.initConnection();
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get MQTT connection status',
    description: 'Retrieves the current status of the MQTT broker connection',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns MQTT connection details including connection state and broker info',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Failed to retrieve connection status',
  })
  async getMqttStatus() {
    return this.mqttClientService.getConnectionStatus();
  }

  @Post('publish')
  @ApiOperation({
    summary: 'Publish message to MQTT topic',
    description:
      'Publishes a message to a specified MQTT topic with configurable QoS and retain flags',
  })
  @ApiResponse({
    status: 201,
    description: 'Message published successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid topic or message format',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Failed to publish message',
  })
  async publish(@Body() publishDto: MqttPublishDto) {
    // Convert message to string if it's an object
    const messagePayload =
      typeof publishDto.message === 'string'
        ? publishDto.message
        : JSON.stringify(publishDto.message);

    return this.mqttClientService.publish(publishDto.topic, messagePayload, {
      qos: publishDto.qos,
      retain: publishDto.retain,
    });
  }

  @Post('subscribe')
  @ApiOperation({
    summary: 'Subscribe to MQTT topics',
    description:
      'Subscribes to one or more MQTT topics for a specific device. Supports wildcard patterns.',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully subscribed to one or more topics',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid topics or device ID',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Failed to subscribe',
  })
  async subscribe(@Body() subscribeDto: MqttSubscribeDto) {
    // Subscribe to each topic in the array
    const subscriptions = await Promise.all(
      subscribeDto.topics.map((topic) =>
        this.mqttClientService.subscribe(topic),
      ),
    );

    return {
      deviceId: subscribeDto.deviceId,
      subscribedTopics: subscribeDto.topics,
      results: subscriptions,
    };
  }

  @Delete('unsubscribe/:topic')
  @ApiOperation({
    summary: 'Unsubscribe from MQTT topic',
    description: 'Removes subscription to a specified MQTT topic',
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully unsubscribed from the topic',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid topic',
  })
  @ApiResponse({
    status: 404,
    description: 'Topic not found - Not subscribed to this topic',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Failed to unsubscribe',
  })
  async unsubscribe(@Param('topic') topic: string) {
    return this.mqttClientService.unsubscribe(topic);
  }

  @Post('reconnect')
  @ApiOperation({
    summary: 'Reconnect to MQTT broker',
    description:
      'Forces a reconnection to the MQTT broker. Useful for recovering from connection failures.',
  })
  @ApiResponse({
    status: 200,
    description: 'Reconnection initiated successfully',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Failed to initiate reconnection',
  })
  async reconnect() {
    return this.mqttClientService.reconnect();
  }
}
