import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { MqttClientService } from './mqtt-client.service';
import { QoS } from '../config/types/mqtt-qos.types';

@Injectable()
export class MqttManagementService {
  private readonly logger = new Logger(MqttManagementService.name);

  constructor(private readonly mqttClientService: MqttClientService) {}

  async getConnectionStatus() {
    return {
      connected: this.mqttClientService.getIsConnected(),
      brokerUrl: this.mqttClientService.getBrokerUrl(),
      subscribedTopics: this.mqttClientService.getSubscribedTopics(),
      lastActivity: this.mqttClientService.getLastConnectionActivity(),
      timestamp: new Date(),
    };
  }

  async publishMessage(
    topic: string,
    message: string,
    qos: QoS = QoS.AtMostOnce,
    retain: boolean = false,
  ) {
    try {
      await this.mqttClientService.publish(topic, message, { qos, retain });

      return {
        success: true,
        topic,
        message,
        description: 'Message published successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        topic,
        message,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  async subscribeToTopic(topic: string, qos: QoS = QoS.AtMostOnce) {
    try {
      await this.mqttClientService.subscribe(
        topic,
        qos,
        (msgTopic, message) => {
          this.logger.log(
            `Message received on topic ${msgTopic}: ${message.toString()}`,
          );
          return {
            success: true,
            topic,
            description: 'Subscribed to topic successfully',
            timestamp: new Date(),
          };
        },
      );
    } catch (error) {
      return {
        success: false,
        topic,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  async unsubscribeFromTopic(topic: string) {
    try {
      await this.mqttClientService.unsubscribe(topic);

      return {
        success: true,
        topic,
        description: 'Unsubscribed from topic successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        topic,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  async getSubscribedTopics() {
    const topics = await this.mqttClientService.getSubscribedTopics();
    return {
      topics,
      count: topics.length,
      timestamp: new Date(),
    };
  }

  async reconnect() {
    // Implementation for manual reconnection

    if (!this.mqttClientService.getIsConnected) {
      this.mqttClientService.initConnection();
    }

    this.logger.log('Manual reconnection requested');

    return {
      success: true,
      message: 'Reconnection initiated',
      timestamp: new Date(),
    };
  }
}
