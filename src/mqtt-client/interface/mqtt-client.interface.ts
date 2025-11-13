/**
 * IMqttClient Interface
 *
 * Abstraction for MQTT client implementation
 * Allows switching between different MQTT libraries without affecting the rest of the application
 * Follows Dependency Inversion Principle
 */

import { IClientOptions, IClientPublishOptions } from 'mqtt';

export interface IMqttClient {
  /**
   * Establishes connection to MQTT broker
   * @param brokerUrl - Broker URL (e.g., 'mqtt://localhost:1883')
   * @param options - Connection options
   * @throws Error if connection fails
   */
  connect(brokerUrl: string, options: IClientOptions): Promise<void>;

  /**
   * Subscribes to one or more MQTT topics
   * @param topics - Single topic or array of topics
   * @throws Error if subscription fails
   */
  subscribe(topics: string | string[]): Promise<void>;

  /**
   * Unsubscribes from MQTT topic(s)
   * @param topics - Single topic or array of topics
   * @throws Error if unsubscription fails
   */
  unsubscribe(topics: string | string[]): Promise<void>;

  /**
   * Publishes message to MQTT topic
   * @param topic - Target topic
   * @param payload - Message payload
   * @param options - Publishing options (QoS, retain, etc.)
   * @throws Error if publish fails
   */
  publish(
    topic: string,
    payload: Buffer | string,
    options?: Partial<IClientPublishOptions>,
  ): Promise<void>;

  /**
   * Disconnects from broker and cleans up resources
   * @throws Error if disconnection fails
   */
  disconnect(): Promise<void>;

  /**
   * Gets current connection state
   */
  isConnected(): boolean;

  /**
   * Returns the broker URL
   */
  getBrokerUrl(): string;

  /**
   * Registers callback for incoming messages
   */
  onMessage(callback: (topic: string, payload: Buffer) => void): void;

  /**
   * Registers callback for connection events
   */
  onConnect(callback: () => void): void;

  /**
   * Registers callback for disconnection events
   */
  onDisconnect(callback: () => void): void;

  /**
   * Registers callback for error events
   */
  onError(callback: (error: Error) => void): void;

  /**
   * Registers callback for reconnection attempts
   */
  onReconnect(callback: () => void): void;

  /**
   * Removes all registered listeners
   * Prevents memory leaks
   */
  removeAllListeners(): void;
}
