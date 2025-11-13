/**
 * MQTT Client Adapter
 *
 * Wraps the mqtt library to implement IMqttClient interface
 * Decouples the application from direct mqtt library dependency
 * Follows Dependency Inversion Principle
 * Prevents memory leaks by properly managing event listeners
 */

import { Logger } from '@nestjs/common';
import {
  connect,
  MqttClient,
  IClientOptions,
  IClientPublishOptions,
} from 'mqtt';
import { IMqttClient } from '@/mqtt-client/interface/mqtt-client.interface';

export class MqttClientAdapter implements IMqttClient {
  private client: MqttClient | null = null;
  private logger = new Logger(MqttClientAdapter.name);
  private messageCallback: ((topic: string, payload: Buffer) => void) | null =
    null;
  private connectCallback: (() => void) | null = null;
  private disconnectCallback: (() => void) | null = null;
  private errorCallback: ((error: Error) => void) | null = null;
  private reconnectCallback: (() => void) | null = null;

  /**
   * Establishes connection to MQTT broker
   * @param brokerUrl - Broker URL (e.g., 'mqtt://localhost:1883')
   * @param options - Connection options
   * @throws Error if connection fails
   */
  async connect(brokerUrl: string, options: IClientOptions): Promise<void> {
    try {
      this.client = connect(brokerUrl, options);

      // Register all callbacks if they were set before connection
      if (this.messageCallback) {
        this.client.on('message', this.messageCallback);
      }
      if (this.connectCallback) {
        this.client.on('connect', this.connectCallback);
      }
      if (this.disconnectCallback) {
        this.client.on('close', this.disconnectCallback);
      }
      if (this.errorCallback) {
        this.client.on('error', this.errorCallback);
      }
      if (this.reconnectCallback) {
        this.client.on('reconnect', this.reconnectCallback);
      }

      this.logger.log(`Connected to MQTT broker: ${brokerUrl}`);
    } catch (error) {
      this.logger.error(`Failed to connect to MQTT broker: ${error.message}`);
      throw error;
    }
  }

  /**
   * Subscribes to one or more MQTT topics
   * @param topics - Single topic or array of topics
   * @throws Error if subscription fails
   */
  async subscribe(topics: string | string[]): Promise<void> {
    if (!this.client || !this.client.connected) {
      throw new Error('MQTT client not connected');
    }

    const topicsArray = Array.isArray(topics) ? topics : [topics];

    return new Promise((resolve, reject) => {
      this.client!.subscribe(topicsArray, (error) => {
        if (error) {
          this.logger.error(`Failed to subscribe to topics: ${error.message}`);
          reject(error);
          return;
        }

        this.logger.log(`Subscribed to ${topicsArray.length} topic(s)`);
        resolve();
      });
    });
  }

  /**
   * Unsubscribes from MQTT topic(s)
   * @param topics - Single topic or array of topics
   * @throws Error if unsubscription fails
   */
  async unsubscribe(topics: string | string[]): Promise<void> {
    if (!this.client || !this.client.connected) {
      throw new Error('MQTT client not connected');
    }

    const topicsArray = Array.isArray(topics) ? topics : [topics];

    return new Promise((resolve, reject) => {
      this.client!.unsubscribe(topicsArray, (error) => {
        if (error) {
          this.logger.error(
            `Failed to unsubscribe from topics: ${error.message}`,
          );
          reject(error);
          return;
        }

        this.logger.log(`Unsubscribed from ${topicsArray.length} topic(s)`);
        resolve();
      });
    });
  }

  /**
   * Publishes message to MQTT topic
   * @param topic - Target topic
   * @param payload - Message payload
   * @param options - Publishing options
   * @throws Error if publish fails
   */
  async publish(
    topic: string,
    payload: Buffer | string,
    options?: Partial<IClientPublishOptions>,
  ): Promise<void> {
    if (!this.client || !this.client.connected) {
      throw new Error('MQTT client not connected');
    }

    return new Promise((resolve, reject) => {
      this.client!.publish(topic, payload, options || {}, (error) => {
        if (error) {
          this.logger.error(`Failed to publish to ${topic}: ${error.message}`);
          reject(error);
          return;
        }

        this.logger.debug(`Published to ${topic}`);
        resolve();
      });
    });
  }

  /**
   * Disconnects from broker and cleans up resources
   * @throws Error if disconnection fails
   */
  async disconnect(): Promise<void> {
    if (!this.client) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.client!.end(false, (error) => {
        if (error) {
          this.logger.error(`Failed to disconnect: ${error.message}`);
          reject(error);
          return;
        }

        this.removeAllListeners();
        this.client = null;
        this.logger.log('Disconnected from MQTT broker');
        resolve();
      });
    });
  }

  /**
   * Gets current connection state
   */
  isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  /**
   * Returns the broker URL
   */
  getBrokerUrl(): string {
    return this.client?.options?.hostname ?? 'unknown';
  }

  /**
   * Registers callback for incoming messages
   * @param callback - Function to call when message arrives
   */
  onMessage(callback: (topic: string, payload: Buffer) => void): void {
    this.messageCallback = callback;
    if (this.client) {
      this.client.on('message', callback);
    }
  }

  /**
   * Registers callback for connection events
   * @param callback - Function to call on successful connection
   */
  onConnect(callback: () => void): void {
    this.connectCallback = callback;
    if (this.client) {
      this.client.on('connect', callback);
    }
  }

  /**
   * Registers callback for disconnection events
   * @param callback - Function to call when disconnected
   */
  onDisconnect(callback: () => void): void {
    this.disconnectCallback = callback;
    if (this.client) {
      this.client.on('close', callback);
    }
  }

  /**
   * Registers callback for error events
   * @param callback - Function to call on error
   */
  onError(callback: (error: Error) => void): void {
    this.errorCallback = callback;
    if (this.client) {
      this.client.on('error', callback);
    }
  }

  /**
   * Registers callback for reconnection attempts
   * @param callback - Function to call on reconnection attempt
   */
  onReconnect(callback: () => void): void {
    this.reconnectCallback = callback;
    if (this.client) {
      this.client.on('reconnect', callback);
    }
  }

  /**
   * Removes all registered listeners
   * Prevents memory leaks when recreating connections
   */
  removeAllListeners(): void {
    if (!this.client) {
      return;
    }

    this.client.removeAllListeners('message');
    this.client.removeAllListeners('connect');
    this.client.removeAllListeners('close');
    this.client.removeAllListeners('error');
    this.client.removeAllListeners('reconnect');

    this.messageCallback = null;
    this.connectCallback = null;
    this.disconnectCallback = null;
    this.errorCallback = null;
    this.reconnectCallback = null;

    this.logger.debug('Removed all MQTT event listeners');
  }
}
