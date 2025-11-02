import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { MqttGatewayService } from './mqtt.service';

@WebSocketGateway(30005, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/mqtt',
})
export class MqttGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MqttGateway.name);
  private connectedClients = new Map<string, Socket>();

  constructor(private readonly mqttGatewayService: MqttGatewayService) {}

  // Handle new client connections
  async handleConnection(client: Socket) {
    const clientId = client.id;
    this.connectedClients.set(clientId, client);

    this.logger.log(`Client connected: ${clientId}`);
    this.logger.log(`Total clients: ${this.connectedClients.size}`);

    try {
      // Send current MQTT status to newly connected client
      const status = await this.mqttGatewayService.getMqttStatus();
      client.emit('mqtt-status', status);

      // Send recent sensor data if available
      const recentData = await this.mqttGatewayService.getRecentSensorData();
      client.emit('sensor-data-batch', recentData);
    } catch (error) {
      this.logger.error(`Error during client connection: ${error.message}`);
      client.emit('connection-error', {
        error: 'Failed to initialize connection',
        timestamp: new Date(),
      });
    }
  }

  // Handle client disconnections
  handleDisconnect(client: Socket) {
    const clientId = client.id;
    this.connectedClients.delete(clientId);

    this.logger.log(`Client disconnected: ${clientId}`);
    this.logger.log(`Total clients: ${this.connectedClients.size}`);
  }

  // Client requests to subscribe to specific sensor topics
  @SubscribeMessage('subscribe-sensor')
  async handleSubscribeSensor(
    client: Socket,
    payload: { sensorId: string; topics: string[] },
  ) {
    try {
      const { sensorId, topics } = payload;

      // Validate input
      if (!topics || topics.length === 0) {
        throw new Error('At least one topic is required');
      }

      // Forward subscription to MQTT broker
      await this.mqttGatewayService.subscribeToTopics(topics);

      // Acknowledge subscription
      client.emit('subscription-confirmed', {
        sensorId,
        topics,
        timestamp: new Date(),
      });

      this.logger.log(
        `Client ${client.id} subscribed to sensor ${sensorId}, topics: ${topics.join(', ')}`,
      );
    } catch (error) {
      this.logger.error(`Subscription error: ${error.message}`);
      client.emit('subscription-error', {
        error: error.message,
        timestamp: new Date(),
      });
    }
  }

  // Client sends command to devices
  @SubscribeMessage('send-command')
  async handleSendCommand(
    client: Socket,
    payload: {
      deviceId: string;
      command: string;
      parameters?: any;
    },
  ) {
    try {
      const { deviceId, command, parameters } = payload;

      // Validate input
      if (!deviceId || !command) {
        throw new Error('Device ID and command are required');
      }

      // Publish command to MQTT
      await this.mqttGatewayService.publishCommand(
        deviceId,
        command,
        parameters,
      );

      // Broadcast command to all clients (for real-time dashboard updates)
      this.server.emit('command-sent', {
        deviceId,
        command,
        parameters,
        sentBy: client.id,
        timestamp: new Date(),
      });

      this.logger.log(`Command sent to device ${deviceId}: ${command}`);
    } catch (error) {
      this.logger.error(`Command error: ${error.message}`);
      client.emit('command-error', {
        error: error.message,
        timestamp: new Date(),
      });
    }
  }

  // Client requests MQTT status
  @SubscribeMessage('get-status')
  async handleGetStatus(client: Socket) {
    try {
      const status = await this.mqttGatewayService.getMqttStatus();
      client.emit('mqtt-status', status);
    } catch (error) {
      client.emit('status-error', {
        error: error.message,
        timestamp: new Date(),
      });
    }
  }

  // Broadcast sensor data to all connected clients
  public broadcastSensorData(sensorData: any) {
    try {
      this.server.emit('sensor-data', {
        ...sensorData,
        timestamp: new Date(),
        clientCount: this.connectedClients.size, // Useful for monitoring
      });
    } catch (error) {
      this.logger.error(`Broadcast error: ${error.message}`);
    }
  }

  // Broadcast MQTT connection status to all clients
  public broadcastMqttStatus(status: any) {
    this.server.emit('mqtt-status', {
      ...status,
      timestamp: new Date(),
    });
  }

  // Broadcast system alerts to all clients
  public broadcastAlert(alert: {
    type: 'warning' | 'error' | 'info';
    message: string;
    sensorId?: string;
    severity: 'low' | 'medium' | 'high';
  }) {
    this.server.emit('system-alert', {
      ...alert,
      timestamp: new Date(),
    });
  }

  // Get connected clients count (for monitoring)
  public getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  // Get client IDs (useful for debugging)
  public getConnectedClientIds(): string[] {
    return Array.from(this.connectedClients.keys());
  }
}
