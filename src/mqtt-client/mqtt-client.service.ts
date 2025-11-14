import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  UnauthorizedException,
} from '@nestjs/common';
import {
  connect,
  MqttClient,
  IClientOptions,
  IClientPublishOptions,
} from 'mqtt';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TopicService } from 'src/topic/topic.service';
import { TopicUseCase } from 'src/topic/enum/topic-usecase.enum';
import { UpdateTopicDto } from 'src/topic/dto/update-topic.dto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class MqttClientService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly topicService: TopicService,
    private eventEmitter: EventEmitter2,
    private readonly config: ConfigService,
  ) {}
  private client: MqttClient;
  private isConnected = false;
  private lastActivity: Date;
  private connectionAttempts = 0;
  private readonly MAX_RECONNECTION_ATTEMPTS = 5;
  private readonly logger = new Logger(MqttClientService.name, {
    timestamp: true,
  });

  async onModuleInit() {
    await this.initConnection();
  }

  async emitEvent(eventName: string, topic: string, payload: any) {
    this.eventEmitter.emit(eventName, topic, payload);
  }

  async initConnection(broker?: string): Promise<void> {
    const brokerUrl = this.config.getOrThrow<string>('MQTT_BROKER_URL'); // 'mqtt://localhost:1883';

    const options: IClientOptions = {
      clientId: `sensor-${process.pid}-${Date.now()}`,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 2000,
      username: this.config.getOrThrow<string>('MQTT_USERNAME'),
      password: this.config.getOrThrow<string>('MQTT_PASSWORD'),
    };

    try {
      this.client = connect(brokerUrl, options);

      this.client.on('connect', async () => {
        this.isConnected = true;
        this.connectionAttempts++;
        this.lastActivity = new Date();
        this.logger.log(`✅ Connected to MQTT broker: ${brokerUrl}`);

        // Create broadcast topic in repo
        await this.topicService.createTopic(
          'broadcast',
          TopicUseCase.BROADCAST,
        );

        this.eventEmitter.emit('mqtt/events/connected', {
          brokerUrl,
          clientId: this.client.options.clientId,
        });
      });

      await this.mqttEvents(brokerUrl);
    } catch (error) {
      this.logger.error(
        `❌ Failed to connect to MQTT broker: ${error.message}`,
      );
      throw error;
    }
  }

  async mqttEvents(brokerUrl: string) {
    this.client.on('message', async (topic: string, payload: Buffer) => {
      // console.log(
      //   `MQTT message received on topic: ${topic}`,
      //   message.toString(),
      // );
      this.lastActivity = new Date();
      // await this.addTopicToRepository(topic);
      const { event, parsedPayload } = await this.handleMessage(topic, payload);
      await this.emitEvent(event, topic, parsedPayload);
    });

    this.client.on('error', (error) => {
      this.logger.error(`❌ MQTT error: ${error.message}`);
      // this.eventEmitter.emit('error', error);
    });

    this.client.on('close', () => {
      this.isConnected = false;
      this.logger.warn('🔌 Disconnected from MQTT broker');
      this.eventEmitter.emit('mqtt/events/disconnected', {
        brokerUrl,
        clientId: this.client.options.clientId,
      });
    });

    this.client.on('reconnect', () => {
      if (this.connectionAttempts < this.MAX_RECONNECTION_ATTEMPTS) {
        this.connectionAttempts++;
        this.logger.log(
          `🔄 Reconnecting to MQTT broker (attempt ${this.connectionAttempts})`,
        );
      }
    });
  }

  async reconnect() {
    // Implementation for manual reconnection

    if (!this.isConnected) {
      this.initConnection();
    }

    this.logger.log('Manual reconnection requested');

    return {
      success: true,
      message: 'Reconnection initiated',
      timestamp: new Date(),
    };
  }

  async subscribe(topic: string, deviceId: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('MQTT client not connected');
    }

    return new Promise((resolve, reject) => {
      this.client.subscribe(topic, async (err) => {
        if (err) {
          this.logger.error(
            `❌ Failed to subscribe to ${topic}: ${err.message}`,
          );
          reject(err);
          return;
        }

        const existing = await this.topicService.getTopicByName(topic);

        if (!existing) {
          this.topicService.storeTopic(deviceId, topic);
        }

        this.logger.log(`✅ Subscribed to ${topic}`);
        resolve();
      });
    });
  }

  async unsubscribe(topic: string): Promise<any> {
    if (!this.isConnected) {
      throw new Error('MQTT client not connected');
    }

    try {
      await this.unsubscribe(topic);
      this.topicService.updateTopic(topic, {
        isActive: false,
      } as UpdateTopicDto);

      this.logger.log(`Unsubscribed from topic: ${topic}`);
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

  async publish(
    topic: string,
    payload: string,
    options: Partial<IClientPublishOptions>,
  ): Promise<any> {
    if (!this.isConnected) {
      throw new Error('MQTT client not connected');
    }
    const { qos, retain } = options;

    try {
      await this.client.publishAsync(topic, payload, { qos, retain });
      this.emitEvent('mqtt/events/publish/success', topic, payload);
      return {
        success: true,
        topic,
        payload,
        description: 'Message published successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('failed to publish message', error.message);
    }
  }

  async getConnectionStatus() {
    return {
      connected: this.isConnected,
      brokerUrl: this.getBrokerUrl(),
      subscribedTopics: await this.topicService.getAllTopics(),
      lastActivity: this.getLastConnectionActivity(),
      timestamp: new Date(),
    };
  }

  async getBrokerUrl(): Promise<string> {
    return this.client?.options?.hostname || 'unknown';
  }

  getLastConnectionActivity(): Date {
    return this.lastActivity;
  }

  async disconnect() {
    try {
      // const topics = await this.topicService.getAllTopics();
      // topics.forEach((topic) =>
      //   this.topicService.updateTopic(topic, {
      //     isActive: false,
      //   } as UpdateTopicDto),
      // );
      await this.onModuleDestroy();
    } catch (error) {
      throw new UnauthorizedException('Failed to disconnect MQTT');
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      this.client.end();
      this.logger.log('MQTT client disconnected');
    }
  }

  private async handleMessage(
    topic: string,
    payload: Buffer,
  ): Promise<{ event: string; parsedPayload: any }> {
    const parsedPayload = await JSON.parse(payload.toString());
    if (topic?.endsWith('/discovery ')) {
      return { event: 'mqtt/message/discovery', parsedPayload };
    }
    if (topic?.endsWith('/ack')) {
      return { event: 'mqtt/message/ack', parsedPayload };
    }
    if (topic?.endsWith('/upgrade')) {
      return { event: 'mqtt/message/upgrade', parsedPayload };
    }
    if (topic?.endsWith('/heatbeat')) {
      return { event: 'mqtt/message/heatbeat', parsedPayload };
    }
    if (topic?.endsWith('/reboot')) {
      return { event: 'mqtt/message/reboot', parsedPayload };
    }
    if (topic?.endsWith('/telemetry')) {
      return { event: 'mqtt/message/telemetry', parsedPayload };
    }
    if (topic?.endsWith('/hardware_status')) {
      return { event: 'mqtt/message/hardware-status', parsedPayload };
    }
    if (topic?.endsWith('/alert')) {
      return { event: 'mqtt/message/alert', parsedPayload };
    }

    return { event: 'mqtt/message/unknown', parsedPayload };
  }
}
