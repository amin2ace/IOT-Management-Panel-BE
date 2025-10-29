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
import { EventEmitter } from 'events';
import { ConfigService } from '@nestjs/config';
import { QoS } from 'src/config/types/mqtt-qos.types';

@Injectable()
export class MqttClientService
  extends EventEmitter
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly config: ConfigService) {
    super();
  }
  private client: MqttClient;
  private isConnected = false;
  private subscribedTopics = new Set<string>();
  private lastActivity: Date;
  private connectionAttempts = 0;
  private readonly MAX_RECONNECTION_ATTEMPTS = 5;

  private readonly logger = new Logger(MqttClientService.name, {
    timestamp: true,
  });

  async onModuleInit() {
    await this.initConnection();
  }

  async initConnection(): Promise<void> {
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

        // Resubscribe to previous topics
        this.resubscribeTopics();

        this.emit('connected');
      });

      this.client.on('message', (topic: string, message: Buffer) => {
        this.lastActivity = new Date();
        this.emit('message', topic, message);
        this.subscribedTopics.add(topic);
      });

      this.client.on('error', (error) => {
        this.logger.error(`❌ MQTT error: ${error.message}`);
        // this.emit('error', error);
      });

      this.client.on('close', () => {
        this.isConnected = false;
        this.logger.warn('🔌 Disconnected from MQTT broker');
        this.emit('disconnected');
        this.subscribedTopics.clear();
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

  private resubscribeTopics() {
    this.subscribedTopics.forEach((topic) => {
      this.client.subscribe(topic, (err) => {
        if (err) {
          this.logger.error(
            `Failed to resubscribe to ${topic}: ${err.message}`,
          );
        } else {
          this.logger.log(`Resubscribed to topic: ${topic}`);
        }
      });
    });
  }

  async subscribe(topic: string, qos: QoS): Promise<void> {
    if (!this.isConnected) {
      throw new Error('MQTT client not connected');
    }

    return new Promise((resolve, reject) => {
      this.client.subscribe(topic, { qos }, (err) => {
        if (err) {
          this.logger.error(`Failed to subscribe to ${topic}: ${err.message}`);
          reject(err);
        } else {
          this.subscribedTopics.add(topic);
          this.logger.log(`✅ Subscribed to topic: ${topic}`);
          resolve();
        }
      });
    });
  }

  async unsubscribe(topic: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('MQTT client not connected');
    }

    return new Promise((resolve, reject) => {
      this.client.unsubscribe(topic, (err) => {
        if (err) {
          reject(err);
        } else {
          this.subscribedTopics.delete(topic);
          this.logger.log(`Unsubscribed from topic: ${topic}`);
          resolve();
        }
      });
    });
  }

  async publish(
    topic: string,
    message: string,
    options: Partial<IClientPublishOptions>,
  ): Promise<void> {
    if (!this.isConnected) {
      throw new Error('MQTT client not connected');
    }
    const { qos, retain } = options;

    return new Promise((resolve, reject) => {
      this.client.publish(topic, message, { qos, retain }, (err) => {
        if (err) {
          this.logger.error(`Failed to publish to ${topic}: ${err.message}`);
          reject(err);
        } else {
          this.lastActivity = new Date();
          resolve();
        }
      });
    });
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getBrokerUrl(): string {
    return this.client?.options?.hostname || 'unknown';
  }

  getSubscribedTopics(): string[] {
    return Array.from(this.subscribedTopics);
  }

  getLastActivity(): Date {
    return this.lastActivity;
  }

  async disconnect() {
    try {
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

  // Event forwarding methods
  onMessage(callback: (topic: string, message: Buffer) => void) {
    this.on('message', callback);
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.on('connected', () => callback(true));
    this.on('disconnected', () => callback(false));
  }
}
