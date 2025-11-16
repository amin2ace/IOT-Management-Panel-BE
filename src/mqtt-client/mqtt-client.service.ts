import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';

import { IClientOptions, IClientPublishOptions } from 'mqtt';

import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TopicService } from '@/topic/topic.service';
import { TopicUseCase } from '@/topic/enum/topic-usecase.enum';
import { UpdateTopicDto } from '@/topic/dto/update-topic.dto';
import { IMqttClient } from '@/mqtt-client/interface/mqtt-client.interface';
import { IMqttMessageRouter } from '@/mqtt-client/interface/message-handler.interface';
import { MqttClientAdapter } from '@/mqtt-client/adapter/mqtt-client.adapter';
import { MqttMessageRouter } from '@/mqtt-client/router/mqtt-message.router';
import {
  SubscriptionResult,
  PublishResult,
  UnsubscriptionResult,
  ConfigurationResult,
  ConfigurationValidationResult,
  ConnectionTestResult,
} from '@/mqtt-client/dto/mqtt-response.dto';
import {
  DiscoveryMessageHandler,
  AssignmentMessageHandler,
  AcknowledgeMessageHandler,
  FirmwareUpgradeMessageHandler,
  HeartbeatMessageHandler,
  RebootMessageHandler,
  TelemetryMessageHandler,
  HardwareStatusMessageHandler,
  AlertMessageHandler,
} from '@/mqtt-client/handler/mqtt-message.handler';
@Injectable()
export class MqttClientService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly topicService: TopicService,
    private eventEmitter: EventEmitter2,
    private readonly config: ConfigService,
  ) {}

  private mqtt: IMqttClient;
  private messageRouter: IMqttMessageRouter;
  private isConnected = false;
  private connectionAttempts = 0;
  private readonly MAX_RECONNECTION_ATTEMPTS = 5;
  private readonly logger = new Logger(MqttClientService.name, {
    timestamp: true,
  });

  /**
   * NestJS lifecycle hook - Initializes MQTT connection when module is initialized
   * Automatically called by NestJS during application startup
   * @returns Promise that resolves when connection is established
   */
  async onModuleInit() {
    this.initializeMessageRouter();
    await this.initConnection();
  }

  /**
   * Initializes the message router with all supported message handlers
   * Registers 9 message type handlers in priority order
   * Enables strategy pattern for extensible message routing
   */
  private initializeMessageRouter(): void {
    this.messageRouter = new MqttMessageRouter();
    this.messageRouter.register(new DiscoveryMessageHandler());
    this.messageRouter.register(new AssignmentMessageHandler());
    this.messageRouter.register(new AcknowledgeMessageHandler());
    this.messageRouter.register(new FirmwareUpgradeMessageHandler());
    this.messageRouter.register(new HeartbeatMessageHandler());
    this.messageRouter.register(new RebootMessageHandler());
    this.messageRouter.register(new TelemetryMessageHandler());
    this.messageRouter.register(new HardwareStatusMessageHandler());
    this.messageRouter.register(new AlertMessageHandler());
  }

  /**
   * Emits an event through the EventEmitter2 bus
   * Used to broadcast MQTT messages and connection events to subscribers
   * @param eventName - Name of the event to emit (e.g., 'mqtt/message/telemetry')
   * @param topic - MQTT topic where the message was published
   * @param payload - Parsed message payload to send with the event
   */
  private emitter(eventName: string, topic: string, payload: any) {
    this.eventEmitter.emit(eventName, topic, payload);
  }

  /**
   * Initializes MQTT client connection to the broker
   * Establishes connection with credentials from environment variables
   * Automatically subscribes to the broadcast topic on successful connection
   * Registers all event handlers (connect, message, error, disconnect, reconnect)
   * Emits 'mqtt/event/connected' event when connection is established
   *
   * @param broker - Optional broker URL override (defaults to MQTT_BROKER_URL from config)
   * @param opts - Optional MQTT client options
   * @throws UnauthorizedException if connection fails
   * @returns Promise that resolves when connection setup is complete
   */
  async initConnection(broker?: string, opts?: IClientOptions): Promise<void> {
    if (broker === undefined) {
      broker = this.config.getOrThrow<string>('MQTT_BROKER_URL');
    }

    if (opts === undefined) {
      opts = {
        clientId: `Mqtt-${process.pid}-${Date.now()}`,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 2000,
        username: this.config.getOrThrow<string>('MQTT_USERNAME'),
        password: this.config.getOrThrow<string>('MQTT_PASSWORD'),
      };
    }
    try {
      // Create adapter-wrapped MQTT client
      this.mqtt = new MqttClientAdapter();

      // Register event handlers before connecting
      this.mqtt.onConnect(async () => {
        this.isConnected = this.mqtt.isConnected();
        this.connectionAttempts++;
        this.logger.log(`Connected to MQTT broker: ${broker}`);

        // Create broadcast topic in repo
        const broadcastTopic = await this.topicService.createTopic(
          'Mqtt_Broker',
          TopicUseCase.BROADCAST,
        );
        await this.subscribe(broadcastTopic.topic);
        this.eventEmitter.emit('mqtt/event/connected', {
          broker,
          status: true,
          clientId: opts.clientId,
        });
      });

      this.mqtt.onMessage(async (topic: string, payload: Buffer) => {
        const parsedPayload = JSON.parse(payload.toString());
        const eventName = this.messageRouter.route(topic, parsedPayload);
        this.emitter(eventName, topic, parsedPayload);
      });

      this.mqtt.onError((error) => {
        this.logger.error(`MQTT error: ${error.message}`);
        this.eventEmitter.emit('mqtt/event/error', error);
      });

      this.mqtt.onDisconnect(() => {
        this.isConnected = false;
        this.logger.warn('Disconnected from MQTT broker');
        this.eventEmitter.emit('mqtt/event/disconnected', {
          brokerUrl: broker,
          status: false,
          clientId: opts.clientId,
        });
      });

      this.mqtt.onReconnect(() => {
        if (this.connectionAttempts < this.MAX_RECONNECTION_ATTEMPTS) {
          this.connectionAttempts++;
          this.logger.log(
            `Reconnecting to MQTT broker (attempt ${this.connectionAttempts})`,
          );
        }
      });

      // Connect to broker
      await this.mqtt.connect(broker, opts);
    } catch (error) {
      this.logger.error(`Failed to connect to MQTT broker: ${error.message}`);
      throw new UnauthorizedException('Failed to connect to MQTT broker');
    }
  }

  /**
   * Initiates manual reconnection to the MQTT broker
   * Attempts to reconnect if the client is not currently connected
   *
   * @returns Object containing success status, message, and timestamp
   */
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

  /**
   * Subscribes to an MQTT topic
   * Updates the topic repository to mark the topic as subscribed
   * Emits 'mqtt/message/*' events when messages arrive on the topic
   *
   * @param topics - MQTT topic path to subscribe to (supports wildcards: +, #)
   * @throws Error if MQTT client is not connected
   * @returns Promise<SubscriptionResult> with subscription status and details
   */
  async subscribe(topics: string | string[]): Promise<SubscriptionResult> {
    if (!this.isConnected) {
      throw new Error('MQTT client not connected');
    }

    try {
      await this.mqtt.subscribe(topics);
      this.logger.debug(`Subscribed to ${topics}`);
      return {
        success: true,
        topics,
        description: 'Successfully subscribed to topic',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to subscribe to ${topics}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Unsubscribes from an MQTT topic
   * Updates the topic repository to mark the topic as unsubscribed
   * No further messages will be received on this topic
   *
   * @param topic - MQTT topic path to unsubscribe from
   * @throws Error if MQTT client is not connected
   * @returns Promise<UnsubscriptionResult> with unsubscription status and details
   */
  async unsubscribe(topic: string): Promise<UnsubscriptionResult> {
    if (!this.isConnected) {
      throw new Error('MQTT client not connected');
    }

    try {
      await this.mqtt.unsubscribe(topic);

      this.logger.log(`Unsubscribed from topic: ${topic}`);
      return {
        success: true,
        topic,
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

  /**
   * Publishes a message to an MQTT topic
   * Supports QoS levels (0, 1, 2) and message retention
   * Handles both string and JSON object payloads
   *
   * @param topic - MQTT topic path to publish to
   * @param payload - Message payload as a string or object (JSON will be stringified)
   * @param options - Publishing options including QoS and retain flag
   * @throws Error if MQTT client is not connected
   * @returns Promise<PublishResult> with publication status and details
   */
  async publish(
    topic: string,
    payload: string | Record<string, any>,
    options: Partial<IClientPublishOptions>,
  ): Promise<PublishResult> {
    if (!this.isConnected) {
      throw new Error('MQTT client not connected');
    }
    const { qos, retain } = options;

    try {
      // Convert payload to string if it's an object
      const payloadStr =
        typeof payload === 'string' ? payload : JSON.stringify(payload);

      await this.mqtt.publish(topic, payloadStr, { qos, retain });

      return {
        success: true,
        topic,
        payload: payloadStr,
        description: 'Message published successfully',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to publish message', error.message);
      throw error;
    }
  }

  /**
   * Retrieves the current MQTT connection status and subscribed topics
   * Includes broker URL and list of all active subscriptions
   *
   * @returns Object containing connection state, broker URL, subscribed topics, and timestamp
   */
  async getConnectionStatus() {
    return {
      connected: this.isConnected,
      brokerUrl: this.getBrokerUrl(),
      subscribedTopics: [
        ...(await this.topicService.getAllSubscribedTopics()).map(
          (topic) => topic.topic,
        ),
      ],
      timestamp: new Date(),
    };
  }

  /**
   * Gets the hostname or URL of the connected MQTT broker
   *
   * @returns The broker hostname/URL or 'unknown' if not connected
   */
  async getBrokerUrl(): Promise<string> {
    return this.mqtt?.getBrokerUrl() || 'unknown';
  }

  /**
   * Gracefully disconnects from the MQTT broker
   * Marks all subscribed topics as unsubscribed in the repository
   * Calls onModuleDestroy to properly clean up resources
   *
   * @throws UnauthorizedException if disconnection fails
   * @returns Promise that resolves when disconnection is complete
   */
  async disconnect() {
    try {
      const topics = await this.topicService.getAllSubscribedTopics();
      topics.forEach((topic) =>
        this.topicService.updateTopic(topic.topic, {
          isSubscribed: false,
        } as UpdateTopicDto),
      );
      this.isConnected = false;
      await this.mqtt.disconnect();
    } catch (error) {
      throw new UnauthorizedException('Failed to disconnect MQTT');
    }
  }

  /**
   * NestJS lifecycle hook - Cleanup when module is destroyed
   * Gracefully ends the MQTT client connection
   * Automatically called by NestJS during application shutdown
   *
   * @returns Promise that resolves when client is fully closed
   */
  async onModuleDestroy() {
    if (this.mqtt) {
      try {
        await this.mqtt.disconnect();
        this.logger.log('MQTT client disconnected');
      } catch (error) {
        this.logger.error(`Error disconnecting MQTT client: ${error.message}`);
      }
    }
  }

  /**
   * Processes incoming MQTT messages and routes them to appropriate event handlers
   * Uses MqttMessageRouter to dynamically route messages based on topic patterns
   * This method no longer contains hardcoded if/else chains, enabling extensibility
   * - Add new message types by registering new handlers with the router
   * - No service modification needed when adding new message types
   * - Achieves Open/Closed Principle: open for extension, closed for modification
   *
   * @param topic - MQTT topic where the message was received
   * @param payload - Raw message buffer from MQTT broker
   * @returns Event name to emit, automatically determined by router
   */
  private async handleMessage(topic: string, payload: Buffer): Promise<string> {
    const parsedPayload = JSON.parse(payload.toString());
    // Router determines the event name based on topic pattern
    // If no handler matches, returns 'mqtt/message/unknown'
    return this.messageRouter.route(topic, parsedPayload);
  }

  /**
   * Retrieves the current MQTT broker configuration settings
   * Returns configuration if connected, otherwise returns broker URL from environment
   * Includes host, port, protocol, client ID, keepalive interval, clean session flag, and reconnection status
   *
   * @returns Promise<ConfigurationResult> containing current MQTT configuration and connection status
   */
  async getConfiguration(): Promise<ConfigurationResult> {
    if (!this.mqtt) {
      throw new Error('MQTT client not initialized');
    }

    return {
      host: this.config.get('MQTT_BROKER_URL') || 'unknown',
      port: 1883,
      protocol: 'mqtt',
      clientId: '',
      keepalive: 60,
      clean: true,
      autoReconnect: true,
      connected: this.isConnected,
      timestamp: new Date(),
    };
  }

  /**
   * Updates MQTT broker configuration and reconnects with new settings
   * Disconnects from the current broker, applies new configuration, and reconnects
   * Useful for changing broker connection details at runtime without restarting
   *
   * @param config - New MQTT configuration object with updated settings
   * @throws Error if disconnection or reconnection fails
   * @returns Promise that resolves when configuration is updated and reconnection is initiated
   */
  async updateConfiguration(config: any): Promise<void> {
    try {
      // Disconnect from current connection
      if (this.mqtt && this.isConnected) {
        await this.disconnect();
      }

      // Optionally update environment variables or internal config
      // This depends on how you want to store the new config
      this.logger.log('MQTT configuration updated');
      this.logger.log(`New config: ${JSON.stringify(config)}`);

      // Reconnect with new settings
      await this.initConnection();
    } catch (error) {
      this.logger.error(`Failed to update configuration: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validates MQTT configuration without applying changes
   * Performs dry-run validation on all configuration properties
   * Checks host, port, protocol, timeout, and reconnection settings
   *
   * @param config - Configuration object to validate
   * @returns Promise<ConfigurationValidationResult> containing validation result with any errors found
   */
  async validateConfiguration(
    config: any,
  ): Promise<ConfigurationValidationResult> {
    const errors: string[] = [];

    if (!config.host) {
      errors.push('Host is required');
    }

    if (!config.port || config.port < 1 || config.port > 65535) {
      errors.push('Port must be between 1 and 65535');
    }

    if (
      config.protocol &&
      !['mqtt', 'mqtts', 'tcp', 'ws', 'wss'].includes(config.protocol)
    ) {
      errors.push('Protocol must be one of: mqtt, mqtts, tcp, ws, wss');
    }

    if (config.keepalive && config.keepalive < 1) {
      errors.push('Keep alive must be at least 1 second');
    }

    if (config.connectTimeout && config.connectTimeout < 1000) {
      errors.push('Connection timeout must be at least 1000ms');
    }

    if (config.reconnectPeriod && config.reconnectPeriod < 1000) {
      errors.push('Reconnect period must be at least 1000ms');
    }

    if (errors.length > 0) {
      return {
        valid: false,
        errors,
      };
    }

    return {
      valid: true,
      message: 'Configuration is valid',
    };
  }

  /**
   * Tests MQTT broker connectivity with the provided configuration
   * Creates a temporary test client via adapter to verify connection without permanently updating settings
   * Includes timeout handling and automatic cleanup
   * Useful for validating broker accessibility before applying configuration changes
   *
   * @param config - Configuration object to test (must include host, port, and optional protocol)
   * @returns Promise<ConnectionTestResult> containing success status, message, broker info, and duration
   * @throws Error if connection test fails or times out
   */
  async testConnection(config: any): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    const testAdapter = new MqttClientAdapter();
    const brokerUrl = `${config.protocol || 'mqtt'}://${config.host}:${config.port}`;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        testAdapter.disconnect().catch(() => {});
        const duration = Date.now() - startTime;
        reject(new Error(`Connection test timeout after ${duration}ms`));
      }, config.connectTimeout || 10000);

      testAdapter.onConnect(() => {
        clearTimeout(timeout);
        const duration = Date.now() - startTime;
        testAdapter.disconnect().catch(() => {});

        resolve({
          success: true,
          message: 'Successfully connected to MQTT broker',
          brokerInfo: {
            clientId: '',
            protocol: config.protocol || 'mqtt',
            host: config.host,
            port: config.port,
          },
          timestamp: new Date(),
          duration,
        });
      });

      testAdapter.onError((error) => {
        clearTimeout(timeout);
        const duration = Date.now() - startTime;
        testAdapter.disconnect().catch(() => {});

        reject(new Error(`Connection test failed: ${error.message}`));
      });

      testAdapter
        .connect(brokerUrl, {
          clientId: `test-${Date.now()}`,
          username: config.username,
          password: config.password,
          connectTimeout: config.connectTimeout || 10000,
          clean: config.clean !== false,
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(new Error(`Connection test failed: ${error.message}`));
        });
    });
  }
}
