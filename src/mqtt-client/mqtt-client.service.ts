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
import { QoS } from 'src/config/types/mqtt-qos.types';
import { InjectRepository } from '@nestjs/typeorm';
import MqttTopic from './repository/mqtt-topic.entity';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MqttClientService implements OnModuleInit, OnModuleDestroy {
  constructor(
    @InjectRepository(MqttTopic)
    private readonly topicRepo: Repository<MqttTopic>,
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

  async emitEvent(eventName: string, ...args: any[]) {
    this.eventEmitter.emit(eventName, ...args);
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

      this.client.on('connect', () => {
        this.isConnected = true;
        this.connectionAttempts++;
        this.lastActivity = new Date();
        this.logger.log(`✅ Connected to MQTT broker: ${brokerUrl}`);

        this.emitEvent('connected', {
          brokerUrl,
          clientId: this.client.options.clientId,
        });
      });

      this.client.on('message', async (topic: string, message: Buffer) => {
        this.lastActivity = new Date();
        await this.addTopicToRepository(topic);
        const { payload } = await this.handleMessage(topic, message);
        this.emitEvent('mqtt.message', topic, payload);
      });

      this.client.on('error', (error) => {
        this.logger.error(`❌ MQTT error: ${error.message}`);
        // this.eventEmitter.emit('error', error);
      });

      this.client.on('close', () => {
        this.isConnected = false;
        this.logger.warn('🔌 Disconnected from MQTT broker');
        this.emitEvent('disconnected', {
          brokerUrl,
          clientId: this.client.options.clientId,
        });
        this.clearTopicsInRepository();
      });

      this.client.on('reconnect', () => {
        if (this.connectionAttempts < this.MAX_RECONNECTION_ATTEMPTS) {
          this.connectionAttempts++;
          this.logger.log(
            `🔄 Reconnecting to MQTT broker (attempt ${this.connectionAttempts})`,
          );
        }
      });
    } catch (error) {
      this.logger.error(
        `❌ Failed to connect to MQTT broker: ${error.message}`,
      );
      throw error;
    }
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

  async subscribe(topic: string, qos: QoS): Promise<void> {
    if (!this.isConnected) {
      throw new Error('MQTT client not connected');
    }

    return new Promise((resolve, reject) => {
      this.client.subscribe(topic, { qos }, async (err) => {
        if (err) {
          this.logger.error(
            `❌ Failed to subscribe to ${topic}: ${err.message}`,
          );
          reject(err);
          return;
        }

        const record = this.topicRepo.create({
          topic,
          brokerUrl: this.getBrokerUrl(),
          isActive: true,
        });
        await this.topicRepo.save(record);
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
      this.topicRepo.update(
        { topic },
        {
          isActive: false,
        },
      );
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
    message: string,
    options: Partial<IClientPublishOptions>,
  ): Promise<any> {
    if (!this.isConnected) {
      throw new Error('MQTT client not connected');
    }
    const { qos, retain } = options;

    try {
      await this.client.publishAsync(topic, message, { qos, retain });
      this.emitEvent('mqtt.publish.success', { topic, message });
      return {
        success: true,
        topic,
        message,
        description: 'Message published successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('failed to publish message', error.message);
      this.emitEvent('mqtt.publish.error', {
        topic,
        message,
        error: error.message,
      });
    }
  }

  async getConnectionStatus() {
    return {
      connected: this.isConnected,
      brokerUrl: this.getBrokerUrl(),
      subscribedTopics: this.getSubscribedTopics(),
      lastActivity: this.getLastConnectionActivity(),
      timestamp: new Date(),
    };
  }

  getBrokerUrl(): string {
    return this.client?.options?.hostname || 'unknown';
  }

  async getSubscribedTopics(): Promise<MqttTopic[]> {
    return await this.topicRepo.find();
  }

  getLastConnectionActivity(): Date {
    return this.lastActivity;
  }

  async disconnect() {
    try {
      const topics = await this.topicRepo.find();
      topics.forEach((topic) =>
        this.topicRepo.update(topic, { isActive: false }),
      );
      await this.onModuleDestroy();
    } catch (error) {
      throw new UnauthorizedException('Failed to disconnect MQTT');
    }
  }

  async addTopicToRepository(topic: string): Promise<MqttTopic> {
    const newTopic = this.topicRepo.create({
      topic,
      brokerUrl: this.getBrokerUrl(),
      isActive: true,
    });
    await this.topicRepo.save(newTopic);
    return newTopic;
  }

  async clearTopicsInRepository(): Promise<void> {
    const topics = await this.topicRepo.find();
    topics.forEach((topic) =>
      this.topicRepo.update(topic, { isActive: false }),
    );
  }

  async onModuleDestroy() {
    if (this.client) {
      this.client.end();
      this.logger.log('MQTT client disconnected');
    }
  }

  private async handleMessage(topic: string, message: Buffer) {
    const payload = await JSON.parse(message.toString());
    return { topic, payload };
  }

  private async matchTopic(
    subscribedTopic: string,
    incomingTopic: string,
  ): Promise<boolean> {
    // Quick conversion: MQTT wildcards to regex
    const regex = new RegExp(
      '^' + subscribedTopic.replace('+', '[^/]+').replace('#', '.+') + '$',
    );
    return regex.test(incomingTopic);
  }
  // Event forwarding methods
  onMessage(callback: (topic: string, message: Buffer) => void) {}
}
