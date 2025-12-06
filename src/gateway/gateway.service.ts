import { Injectable, OnModuleInit } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MqttClientService } from '../mqtt-client/mqtt-client.service';
import { IClientPublishOptions } from 'mqtt';
import { InjectRepository } from '@nestjs/typeorm';
import MessageIncoming, {
  ParsedMessagePayload,
} from './repository/message-incoming.entity';
import { Repository } from 'typeorm';
import { IncomeMessageDto, MessageFormat } from './dto/message-income.dto';
import { SensorDataDto, DataQuality } from './dto/sensor-data.dto';
import { DeviceService } from '@/device/device.service';
import {
  PublishDiscoveryBroadcastDto,
  PublishDiscoveryUnicastDto,
  RequestMessageCode,
  PublishSensorFunctionalityDto,
} from '@/device/dto/messages';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SensorFunctionAssignDto } from '@/device/dto/sensor-assign-type.dto';
import { QuerySensorDto } from '@/device/dto/query-sensor.dto';
import { DiscoveryResponseDto } from '@/responser/dto';
import { GetAllDevicesResponseDto } from '@/device/dto/get-all-devices.response.dto';

/**
 * MqttGatewayService
 *
 * Acts as a bridge between MQTT client service and WebSocket gateway
 * Responsibilities:
 * - Subscribe to MQTT topics via MqttClientService
 * - Process incoming MQTT messages
 * - Store message history in database
 * - Maintain in-memory cache of recent sensor data
 * - Emit events for WebSocket broadcast
 *
 * Architecture:
 * MQTT → MqttClientService → MqttGatewayService → EventEmitter2 → WsGateway → Frontend
 */

@WebSocketGateway(30005, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/mqtt',
})
@Injectable()
export class GatewayService
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  private readonly logger = new Logger(GatewayService.name);
  private recentSensorData: IncomeMessageDto[] = [];
  private readonly MAX_RECENT_DATA = 100;
  private subscriptionTracking = new Map<string, boolean>();
  private connectedClients = new Map<string, Socket>();
  private clientSubscriptions = new Map<string, Set<string>>();

  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(MessageIncoming)
    private readonly messageRepo: Repository<MessageIncoming>,
    private readonly mqttClientService: MqttClientService,
    private readonly eventEmitter: EventEmitter2,
    private readonly deviceService: DeviceService,
  ) {}

  async onModuleInit() {
    /**
     * Listen to MQTT message events from MqttClientService
     * The service emits typed events via EventEmitter2
     * This gateway processes and stores messages, then emits WebSocket events
     */
    this.setupMqttEventListeners();
  }

  // Handle new client connections
  async handleConnection(client: Socket) {
    const clientId = client.id;
    this.connectedClients.set(clientId, client);
    this.clientSubscriptions.set(clientId, new Set());

    this.logger.log(`Client connected: ${clientId}`);
    this.logger.log(`Total clients: ${this.connectedClients.size}`);

    // try {
    //   // Send current MQTT status to newly connected client
    //   const status = await this.mqttGatewayService.getMqttStatus();
    //   client.emit('mqtt-status', status);

    //   // Send recent sensor data if available
    //   const recentData = await this.mqttGatewayService.getRecentSensorData();
    //   client.emit('sensor-data-batch', recentData);
    // } catch (error) {
    //   this.logger.error(`Error during client connection: ${error.message}`);
    //   client.emit('connection-error', {
    //     error: 'Failed to initialize connection',
    //     timestamp: new Date(),
    //   });
    // }
  }

  // Handle client disconnections
  handleDisconnect(client: Socket) {
    const clientId = client.id;
    this.connectedClients.delete(clientId);
    this.clientSubscriptions.delete(clientId);

    this.logger.log(`Client disconnected: ${clientId}`);
    this.logger.log(`Total clients: ${this.connectedClients.size}`);
  }

  // Handle events published by UI
  // UI ---> Web Socket Gateway ---> MQTT Broker
  @SubscribeMessage('react/message/discovery/broadcast/request')
  private async handleDiscoveryBroadcast(
    client: Socket,
    payload: PublishDiscoveryBroadcastDto,
  ) {
    await this.deviceService.discoverDevicesBroadcast(payload);
  }

  @SubscribeMessage('react/message/discovery/unicast/request')
  private async handleDiscoveryUnicast(
    client: Socket,
    payload: PublishDiscoveryUnicastDto,
  ) {
    this.logger.log(payload);
    await this.deviceService.discoverDeviceUnicast(payload);
  }

  @SubscribeMessage('react/message/device/query/unassinged/request')
  private async handleUnassigendDevicesQuery(
    client: Socket,
    payload: {
      userId: string;
      requestId: string;
      requestCode: RequestMessageCode;
      deviceId: string;
      timestamp: number;
    },
  ) {
    const result = await this.deviceService.getUnassignedSensor();
    return await this.emitQueryUnassignedDeviceMessage(result);
  }

  @SubscribeMessage('react/message/device/function/assign/request')
  private async handleSensorProvision(
    client: Socket,
    payload: PublishSensorFunctionalityDto,
  ) {
    await this.deviceService.AssignDeviceFunction(payload);
  }

  @SubscribeMessage('react/message/query/devices/all/request')
  private async handleGetSensorsConfiguration(
    client: Socket,
    payload: PublishSensorFunctionalityDto,
  ) {
    const query = await this.deviceService.getAllSensors({});
    await this.emitGetAllSensorsMessage(query);
  }

  /**
   * Setup listeners for MQTT message events emitted by MqttClientService
   * These events come from the message router which routes based on topic patterns
   */
  private setupMqttEventListeners(): void {
    // Listen for all message types from MQTT client service
    // Events are emitted by message handlers via EventEmitter2
    // Discovery messages
    // this.eventEmitter.on('mqtt/message/discovery', async (topic, payload) => {
    //   await this.emitDiscoveryBroadcastMessage(payload);
    // });
    // // Assignment messages
    // this.eventEmitter.on('mqtt/message/assign', async (topic, payload) => {
    //   await this.handleAssignmentMessage(topic, payload);
    // });
    // // Acknowledgment messages
    // this.eventEmitter.on('mqtt/message/ack', async (topic, payload) => {
    //   await this.handleAckMessage(topic, payload);
    // });
    // // Firmware upgrade messages
    // this.eventEmitter.on('mqtt/message/upgrade', async (topic, payload) => {
    //   await this.handleFirmwareUpgradeMessage(topic, payload);
    // });
    // // Heartbeat messages
    // this.eventEmitter.on('mqtt/message/heartbeat', async (topic, payload) => {
    //   await this.handleHeartbeatMessage(topic, payload);
    // });
    // // Reboot messages
    // this.eventEmitter.on('mqtt/message/reboot', async (topic, payload) => {
    //   await this.handleRebootMessage(topic, payload);
    // });
    // // Telemetry messages
    // this.eventEmitter.on('mqtt/message/telemetry', async (topic, payload) => {
    //   await this.handleTelemetryMessage(topic, payload);
    // });
    // // Hardware status messages
    // this.eventEmitter.on(
    //   'mqtt/message/hardware-status',
    //   async (topic, payload) => {
    //     await this.handleHardwareStatusMessage(topic, payload);
    //   },
    // );
    // // Alert messages
    // this.eventEmitter.on('mqtt/message/alert', async (topic, payload) => {
    //   await this.handleAlertMessage(topic, payload);
    // });
    // this.logger.log('MQTT event listeners configured for 9 message types');
  }

  // ============================================================================
  // MESSAGE TYPE HANDLERS
  // ============================================================================
  // Each handler processes its specific message type and emits WebSocket events

  /**
   * Handles device discovery messages
   */
  public async emitDiscoveryBroadcastMessage(payload: DiscoveryResponseDto) {
    try {
      // const incomeMessage = await this.createMessageDto(payload, 'discovery');
      // await this.storeMessageInDatabase(incomeMessage, 0);
      // this.storeRecentData(incomeMessage);

      // Emit WebSocket event for discovery
      this.server.emit('ws/message/discovery/broadcast/response', payload);

      this.logger.log(`Discovery message passed to react`);
    } catch (error) {
      this.logger.error(`Error handling discovery message: ${error.message}`);
    }
  }

  public async emitDiscoveryUnicastMessage(payload: DiscoveryResponseDto) {
    try {
      // const incomeMessage = await this.createMessageDto(payload, 'discovery');
      // await this.storeMessageInDatabase(incomeMessage, 0);
      // this.storeRecentData(incomeMessage);

      // Emit WebSocket event for discovery
      this.server.emit('ws/message/discovery/unicast/response', payload);

      this.logger.log(`Discovery message passed to react`);
    } catch (error) {
      this.logger.error(`Error handling discovery message: ${error.message}`);
    }
  }

  /**
   * Emits the unassigned devices
   *
   * @param result Array of unassigned devices
   */
  public async emitQueryUnassignedDeviceMessage(result: QuerySensorDto[]) {
    try {
      // Emit WebSocket event for discovery
      this.server.emit('ws/message/unassinged/query/response', result);

      this.logger.log(`Discovery message passed to react`);
    } catch (error) {
      this.logger.error(`Error handling discovery message: ${error.message}`);
    }
  }

  /**
   * Emits the unassigned devices
   *
   * @param result Array of unassigned devices
   */
  public async emitGetAllSensorsMessage(result: GetAllDevicesResponseDto) {
    try {
      // Emit WebSocket event for discovery
      this.server.emit('ws/message/query/devices/all/response', result);

      this.logger.log(`Devices query message passed to react`);
    } catch (error) {
      this.logger.error(
        `Error handling query devices message: ${error.message}`,
      );
    }
  }

  /**
   * Handles device assignment messages
   */
  private async handleAssignmentMessage(topic: string, payload: any) {
    try {
      const incomeMessage = await this.createMessageDto(
        topic,
        payload,
        'assignment',
      );
      await this.storeMessageInDatabase(incomeMessage, 0);
      this.storeRecentData(incomeMessage);

      this.eventEmitter.emit('ws/assignment', {
        event: 'device-assigned',
        data: payload,
        timestamp: new Date(),
      });

      this.logger.log(`Assignment message processed from ${topic}`);
    } catch (error) {
      this.logger.error(`Error handling assignment message: ${error.message}`);
      await this.storeErrorInDatabase(topic, payload, error.message);
    }
  }

  /**
   * Handles acknowledgment messages
   */
  private async handleAckMessage(topic: string, payload: any) {
    try {
      const incomeMessage = await this.createMessageDto(topic, payload, 'ack');
      await this.storeMessageInDatabase(incomeMessage, 0);
      this.storeRecentData(incomeMessage);

      this.eventEmitter.emit('ws/ack', {
        event: 'acknowledgment-received',
        data: payload,
        timestamp: new Date(),
      });

      this.logger.log(`ACK message processed from ${topic}`);
    } catch (error) {
      this.logger.error(`Error handling ACK message: ${error.message}`);
      await this.storeErrorInDatabase(topic, payload, error.message);
    }
  }

  /**
   * Handles firmware upgrade messages
   */
  private async handleFirmwareUpgradeMessage(topic: string, payload: any) {
    try {
      const incomeMessage = await this.createMessageDto(
        topic,
        payload,
        'upgrade',
      );
      await this.storeMessageInDatabase(incomeMessage, 0);
      this.storeRecentData(incomeMessage);

      this.eventEmitter.emit('ws/upgrade', {
        event: 'firmware-upgrade-status',
        data: payload,
        timestamp: new Date(),
      });

      this.logger.log(`Firmware upgrade message processed from ${topic}`);
    } catch (error) {
      this.logger.error(
        `Error handling firmware upgrade message: ${error.message}`,
      );
      await this.storeErrorInDatabase(topic, payload, error.message);
    }
  }

  /**
   * Handles heartbeat messages
   */
  private async handleHeartbeatMessage(topic: string, payload: any) {
    try {
      const incomeMessage = await this.createMessageDto(
        topic,
        payload,
        'heartbeat',
      );
      await this.storeMessageInDatabase(incomeMessage, 0);
      this.storeRecentData(incomeMessage);

      this.eventEmitter.emit('ws/heartbeat', {
        event: 'heartbeat-received',
        data: payload,
        timestamp: new Date(),
      });

      this.logger.log(`Heartbeat message processed from ${topic}`);
    } catch (error) {
      this.logger.error(`Error handling heartbeat message: ${error.message}`);
      await this.storeErrorInDatabase(topic, payload, error.message);
    }
  }

  /**
   * Handles device reboot messages
   */
  private async handleRebootMessage(topic: string, payload: any) {
    try {
      const incomeMessage = await this.createMessageDto(
        topic,
        payload,
        'reboot',
      );
      await this.storeMessageInDatabase(incomeMessage, 0);
      this.storeRecentData(incomeMessage);

      this.eventEmitter.emit('ws/reboot', {
        event: 'device-rebooted',
        data: payload,
        timestamp: new Date(),
      });

      this.logger.log(`Reboot message processed from ${topic}`);
    } catch (error) {
      this.logger.error(`Error handling reboot message: ${error.message}`);
      await this.storeErrorInDatabase(topic, payload, error.message);
    }
  }

  /**
   * Handles telemetry messages (sensor data)
   */
  private async handleTelemetryMessage(topic: string, payload: any) {
    try {
      const incomeMessage = await this.createMessageDto(
        topic,
        payload,
        'telemetry',
      );
      await this.storeMessageInDatabase(incomeMessage, 0);
      this.storeRecentData(incomeMessage);

      this.eventEmitter.emit('ws/telemetry', {
        event: 'telemetry-received',
        data: payload,
        timestamp: new Date(),
      });

      this.logger.log(`Telemetry message processed from ${topic}`);
    } catch (error) {
      this.logger.error(`Error handling telemetry message: ${error.message}`);
      await this.storeErrorInDatabase(topic, payload, error.message);
    }
  }

  /**
   * Handles hardware status messages
   */
  private async handleHardwareStatusMessage(topic: string, payload: any) {
    try {
      const incomeMessage = await this.createMessageDto(
        topic,
        payload,
        'hardware-status',
      );
      await this.storeMessageInDatabase(incomeMessage, 0);
      this.storeRecentData(incomeMessage);

      this.eventEmitter.emit('ws/hardware-status', {
        event: 'hardware-status-received',
        data: payload,
        timestamp: new Date(),
      });

      this.logger.log(`Hardware status message processed from ${topic}`);
    } catch (error) {
      this.logger.error(
        `Error handling hardware status message: ${error.message}`,
      );
      await this.storeErrorInDatabase(topic, payload, error.message);
    }
  }

  /**
   * Handles alert messages
   */
  private async handleAlertMessage(topic: string, payload: any) {
    try {
      const incomeMessage = await this.createMessageDto(
        topic,
        payload,
        'alert',
      );
      await this.storeMessageInDatabase(incomeMessage, 0);
      this.storeRecentData(incomeMessage);

      this.eventEmitter.emit('ws/alert', {
        event: 'alert-received',
        data: payload,
        timestamp: new Date(),
      });

      this.logger.log(`Alert message processed from ${topic}`);
    } catch (error) {
      this.logger.error(`Error handling alert message: ${error.message}`);
      await this.storeErrorInDatabase(topic, payload, error.message);
    }
  }

  /**
   * Creates a standardized message DTO for any incoming message
   */
  private async createMessageDto(
    topic: string,
    payload: any,
    messageType: string,
  ): Promise<IncomeMessageDto> {
    const rawData =
      typeof payload === 'string' ? payload : JSON.stringify(payload);
    const parsedData = await this.parseSensorData(topic, payload);

    return {
      topic,
      rawData,
      parsedData,
      timestamp: new Date(),
      messageFormat: MessageFormat.JSON,
      messageSize: Buffer.byteLength(rawData),
      qualityScore: this.calculateQualityScore(parsedData, payload),
    };
  }

  private detectMessageFormat(rawData: string): MessageFormat {
    try {
      JSON.parse(rawData);
      return MessageFormat.JSON;
    } catch {
      return /[\x00-\x08\x0E-\x1F]/.test(rawData)
        ? MessageFormat.BINARY
        : MessageFormat.TEXT;
    }
  }

  private async parseSensorData(
    topic: string,
    payload: any,
  ): Promise<SensorDataDto> {
    const topicParts = topic.split('/');
    const deviceId =
      topicParts.length > 2 ? topicParts[2] : payload.deviceId || 'unknown';
    const sensorType = topicParts[1] || payload.sensorType || 'unknown';

    // Enhanced parsing with fallbacks
    return {
      deviceId,
      sensorType,
      value: payload.value ?? payload.data ?? payload.measurement ?? 'unknown',
      unit: payload.unit ?? this.inferUnit(sensorType),
      quality: this.determineDataQuality(payload),
      location: payload.location ?? this.inferLocation(topic),
      battery: payload.battery,
      signalStrength: payload.signalStrength ?? payload.rssi,
      additionalData: this.extractAdditionalData(payload),
      timestamp: payload.timestamp ?? new Date().toISOString(),
    };
  }

  private inferUnit(sensorType: string): string {
    const unitMap: Record<string, string> = {
      temperature: '°C',
      humidity: '%',
      pressure: 'hPa',
      voltage: 'V',
      current: 'A',
      power: 'W',
      light: 'lux',
    };
    return unitMap[sensorType] || 'unknown';
  }

  private inferLocation(topic: string): string {
    const parts = topic.split('/');
    return parts.length > 2 ? parts[2] : 'unknown';
  }

  private determineDataQuality(payload: any): DataQuality {
    // Simple quality determination logic
    if (payload.error || payload.status === 'error') return DataQuality.ERROR;
    if (payload.battery < 10) return DataQuality.POOR;
    if (payload.signalStrength < -80) return DataQuality.FAIR;
    if (payload.quality) return payload.quality as DataQuality;

    return DataQuality.GOOD;
  }

  private extractAdditionalData(payload: any): Record<string, any> {
    const reservedFields = [
      'value',
      'unit',
      'quality',
      'deviceId',
      'sensorType',
      'location',
      'battery',
      'signalStrength',
      'timestamp',
      'rssi',
      'error',
      'status',
    ];

    const additionalData: Record<string, any> = {};
    for (const [key, value] of Object.entries(payload)) {
      if (!reservedFields.includes(key)) {
        additionalData[key] = value;
      }
    }
    return additionalData;
  }

  private calculateQualityScore(
    parsedData: SensorDataDto,
    rawPayload: any,
  ): number {
    let score = 1.0;

    // Deduct for missing critical fields
    if (!parsedData.value || parsedData.value === 'unknown') score -= 0.3;
    if (parsedData.unit === 'unknown') score -= 0.1;
    if (parsedData.quality === DataQuality.ERROR) score -= 0.5;
    if (parsedData.quality === DataQuality.POOR) score -= 0.3;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Get current MQTT connection status
   * Uses the refactored MqttClientService for accurate status
   */
  async getMqttStatus() {
    return this.mqttClientService.getConnectionStatus();
  }

  /**
   * Subscribe to MQTT topics via MqttClientService
   * The service handles connection state checking and topic repository updates
   *
   * @param topics - Array of MQTT topic paths to subscribe to
   * @param deviceId - Device ID for tracking subscriptions
   */
  async subscribeToTopics(topics: string[], deviceId: string) {
    for (const topic of topics) {
      try {
        await this.mqttClientService.subscribe(topic);
        this.subscriptionTracking.set(topic, true);
        this.logger.log(
          `Subscribed to topic: ${topic} for device: ${deviceId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to subscribe to topic ${topic}: ${error.message}`,
        );
      }
    }
  }

  /**
   * Unsubscribe from MQTT topics via MqttClientService
   *
   * @param topics - Array of MQTT topic paths to unsubscribe from
   */
  async unsubscribeFromTopics(topics: string[]) {
    for (const topic of topics) {
      try {
        await this.mqttClientService.unsubscribe(topic);
        this.subscriptionTracking.delete(topic);
        this.logger.log(`Unsubscribed from topic: ${topic}`);
      } catch (error) {
        this.logger.error(
          `Failed to unsubscribe from topic ${topic}: ${error.message}`,
        );
      }
    }
  }

  /**
   * Publish command to device via MQTT
   *
   * @param deviceId - Target device ID
   * @param command - Command name
   * @param parameters - Command parameters
   */
  async publishCommand(deviceId: string, command: string, parameters?: any) {
    const topic = `devices/${deviceId}/commands`;
    const options: Partial<IClientPublishOptions> = {
      qos: 1,
      retain: false,
    };

    const payload = {
      command,
      parameters,
      timestamp: new Date().toISOString(),
    };

    try {
      await this.mqttClientService.publish(
        topic,
        JSON.stringify(payload),
        options,
      );
      this.logger.log(`Command published to ${topic}: ${command}`);
    } catch (error) {
      this.logger.error(`Failed to publish command: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get recent sensor data from in-memory cache
   */
  async getRecentSensorData() {
    return this.recentSensorData;
  }

  /**
   * Store message in database with processing time metadata
   */
  private async storeMessageInDatabase(
    incomeMessage: IncomeMessageDto,
    processingTime: number,
  ) {
    const parsedPayload: ParsedMessagePayload = {
      deviceId: incomeMessage.parsedData.deviceId,
      sensorType: incomeMessage.parsedData.sensorType,
      value: incomeMessage.parsedData.value,
      unit: incomeMessage.parsedData.unit,
      quality: incomeMessage.parsedData.quality,
      timestamp: incomeMessage.parsedData.timestamp,
      location: incomeMessage.parsedData.location,
      battery: incomeMessage.parsedData.battery,
      signalStrength: incomeMessage.parsedData.signalStrength,
      additionalData: incomeMessage.parsedData.additionalData,
    };

    const messageEntity = new MessageIncoming({
      deviceId: incomeMessage.parsedData.deviceId,
      topic: incomeMessage.topic,
      payload: incomeMessage.rawData,
      parsedPayload,
      messageSize: incomeMessage.messageSize,
      messageFormat: incomeMessage.messageFormat as any,
      qos: 0,
      retain: false,
      dup: false,
      direction: 'incoming' as any,
      status: 'processed',
      processingTime,
      processedAt: new Date(),
    });

    await this.messageRepo.save(messageEntity);
  }

  /**
   * Store error message in database
   */
  private async storeErrorInDatabase(
    topic: string,
    payload: any,
    error: string,
  ) {
    const errorEntity = new MessageIncoming({
      deviceId: 'unknown',
      topic,
      payload: typeof payload === 'string' ? payload : JSON.stringify(payload),
      status: 'error',
      error,
      direction: 'incoming' as any,
    });

    try {
      await this.messageRepo.save(errorEntity);
    } catch (dbError) {
      this.logger.error(
        `Failed to store error in database: ${dbError.message}`,
      );
    }
  }

  /**
   * Store recent data in in-memory cache
   */
  private storeRecentData(sensorData: IncomeMessageDto) {
    this.recentSensorData.unshift(sensorData);

    if (this.recentSensorData.length > this.MAX_RECENT_DATA) {
      this.recentSensorData = this.recentSensorData.slice(
        0,
        this.MAX_RECENT_DATA,
      );
    }
  }
}
