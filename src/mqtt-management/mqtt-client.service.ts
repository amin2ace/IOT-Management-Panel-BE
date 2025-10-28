import {
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, MqttClient } from 'mqtt';

@Injectable()
export class MqttClientService implements OnModuleInit {
  constructor(private readonly config: ConfigService) {
    this.onModuleInit();
  }

  private client: MqttClient;
  public isConnected = false;

  async onModuleInit() {
    await this.connect();
  }

  public async getConnectionStatus() {
    return {
      connected: this.isConnected,
      timestamp: new Date(),
    };
  }

  private async connect() {
    const brokerUrl = this.config.getOrThrow<string>('MQTT_BROKER_URL');
    this.client = connect(brokerUrl);

    this.client.on('connect', () => {
      this.isConnected = true;
      console.log('✅ MQTT Client Connected');
    });

    this.client.on('message', (topic, message) => {
      // Process incoming messages
      this.handleMessage(topic, message);
    });
  }

  public async publish(topic: string, message: string) {
    try {
      const mqttClient = this.client.publish(topic, message);
      return mqttClient;
    } catch (error) {
      throw new UnauthorizedException('Publish error');
    }
  }

  public subscribe(topic: string) {
    try {
      const mqttClient = this.client.subscribe(topic);
      if (mqttClient) {
        return true;
      }
      return false;
    } catch (error) {
      throw new UnauthorizedException('Publish error');
    }
  }

  private handleMessage(topic: string, message: Buffer) {
    // Business logic for processing messages
  }
}
