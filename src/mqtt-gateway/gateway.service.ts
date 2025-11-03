import { Injectable, OnModuleInit } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { MqttClientService } from '../mqtt-management/mqtt-client.service';
import { IClientPublishOptions } from 'mqtt';
import { QoS } from 'src/config/types/mqtt-qos.types';
import { InjectRepository } from '@nestjs/typeorm';
import MessageIncoming, {
  ParsedMessagePayload,
} from './repository/message-incoming.entity';
import { Repository } from 'typeorm';
import { IncomeMessageDto, MessageFormat } from './dto/message-income.dto';
import { SensorDataDto, DataQuality } from './dto/sensor-data.dto';

@Injectable()
export class MqttGatewayService implements OnModuleInit {
  private messageCallbacks: ((message: IncomeMessageDto) => void)[] = [];
  private gatewayCallbacks: ((data: any) => void)[] = [];
  private readonly logger = new Logger(MqttGatewayService.name);
  private recentSensorData: IncomeMessageDto[] = [];
  private readonly MAX_RECENT_DATA = 100;

  constructor(
    @InjectRepository(MessageIncoming)
    private readonly messageRepo: Repository<MessageIncoming>,
    private readonly mqttClientService: MqttClientService,
  ) {}

  async onModuleInit() {
    // Subscribe to incoming MQTT messages
    this.setupMqttMessageHandlers();
  }

  /**
   * Simple callback registration for the gateway
   */
  public registerGatewayCallback(callback: (data: any) => void): void {
    this.gatewayCallbacks.push(callback);
  }

  /**
   * Notify gateway when new data arrives
   */
  private notifyGateway(data: any): void {
    this.gatewayCallbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        this.logger.error(`Gateway callback error: ${error.message}`);
      }
    });
  }

  private setupMqttMessageHandlers() {
    this.mqttClientService.onMessage(async (topic: string, message: Buffer) => {
      try {
        const startTime = Date.now();
        const incomeMessage = await this.processIncomingMessage(topic, message);

        // Store in database
        await this.storeMessageInDatabase(
          incomeMessage,
          Date.now() - startTime,
        );

        // Store in recent data cache
        this.storeRecentData(incomeMessage);

        // ✅ Simple notification to gateway
        this.notifyGateway(incomeMessage);

        this.logger.log(
          `Processed message from ${incomeMessage.parsedData.sensorId}`,
        );

        return incomeMessage;
      } catch (error) {
        this.logger.error(`Error processing MQTT message: ${error.message}`);
        // Store error message in database
        await this.storeErrorInDatabase(topic, message, error.message);
      }
    });
  }

  private async processIncomingMessage(
    topic: string,
    message: Buffer,
  ): Promise<IncomeMessageDto> {
    const rawData = message.toString();
    const messageFormat = this.detectMessageFormat(rawData);

    let parsedPayload: any;
    try {
      parsedPayload =
        messageFormat === MessageFormat.JSON
          ? JSON.parse(rawData)
          : { raw: rawData };
    } catch (error) {
      throw new Error(`Failed to parse message: ${error.message}`);
    }

    const parsedData = await this.parseSensorData(topic, parsedPayload);

    return {
      topic,
      rawData,
      parsedData,
      timestamp: new Date(),
      messageFormat,
      messageSize: message.length,
      qualityScore: this.calculateQualityScore(parsedData, parsedPayload),
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
    const sensorId =
      topicParts.length > 2 ? topicParts[2] : payload.sensorId || 'unknown';
    const sensorType = topicParts[1] || payload.sensorType || 'unknown';

    // Enhanced parsing with fallbacks
    return {
      sensorId,
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
      'sensorId',
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

  private async storeMessageInDatabase(
    incomeMessage: IncomeMessageDto,
    processingTime: number,
  ) {
    const parsedPayload: ParsedMessagePayload = {
      sensorId: incomeMessage.parsedData.sensorId,
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
      deviceId: incomeMessage.parsedData.sensorId,
      topic: incomeMessage.topic,
      payload: incomeMessage.rawData,
      parsedPayload,
      messageSize: incomeMessage.messageSize,
      messageFormat: incomeMessage.messageFormat as any,
      qos: 0, // You might want to capture this from MQTT
      retain: false, // You might want to capture this from MQTT
      dup: false, // You might want to capture this from MQTT
      direction: 'incoming' as any, // Assuming incoming direction
      status: 'processed',
      processingTime,
      processedAt: new Date(),
    });

    await this.messageRepo.save(messageEntity);
  }

  private async storeErrorInDatabase(
    topic: string,
    message: Buffer,
    error: string,
  ) {
    const errorEntity = new MessageIncoming({
      deviceId: 'unknown',
      topic,
      payload: message.toString(),
      status: 'error',
      error,
      direction: 'incoming' as any,
    });

    await this.messageRepo.save(errorEntity);
  }

  private async storeRecentData(sensorData: IncomeMessageDto) {
    this.recentSensorData.unshift(sensorData);

    if (this.recentSensorData.length > this.MAX_RECENT_DATA) {
      this.recentSensorData = this.recentSensorData.slice(
        0,
        this.MAX_RECENT_DATA,
      );
    }
  }
  // Get current MQTT connection status
  async getMqttStatus() {
    return {
      connected: this.mqttClientService.getIsConnected(),
      brokerUrl: this.mqttClientService.getBrokerUrl(),
      subscribedTopics: await this.mqttClientService.getSubscribedTopics(),
      lastActivity: this.mqttClientService.getLastConnectionActivity(),
    };
  }

  // Subscribe to MQTT topics
  async subscribeToTopics(topics: string[]) {
    const qos: QoS = QoS.AtLeastOnce;
    for (const topic of topics) {
      await this.mqttClientService.subscribe(
        topic,
        qos,
        async (topic, message) => {
          return { topic, message };
        },
      );
    }
  }

  // Publish command to devices
  async publishCommand(deviceId: string, command: string, parameters?: any) {
    const topic = `devices/${deviceId}/commands`;
    const options = { qos: 0, retain: false } as IClientPublishOptions;
    const payload = {
      command,
      parameters,
      timestamp: new Date().toISOString(),
    };

    await this.mqttClientService.publish(
      topic,
      JSON.stringify(payload),
      options,
    );
  }

  // Get recent sensor data for new connections
  async getRecentSensorData() {
    return this.recentSensorData;
  }

  // Process and broadcast sensor data (called by MQTT client service)
  public handleSensorData(sensorData: any) {
    this.recentSensorData.unshift(sensorData);

    // Keep data size manageable
    if (this.recentSensorData.length > this.MAX_RECENT_DATA) {
      this.recentSensorData.pop();
    }

    return sensorData;
  }
}
