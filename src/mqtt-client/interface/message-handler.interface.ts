/**
 * IMqttMessageHandler Interface
 *
 * Strategy pattern for handling different MQTT message types
 * Allows extensibility without modifying the routing logic
 * Follows Open/Closed Principle
 */

export interface IMqttMessageHandler {
  /**
   * Determines if this handler can process the message
   * @param topic - MQTT topic where message arrived
   * @returns True if handler should process this message
   */
  canHandle(topic: string): boolean;

  /**
   * Processes the message and returns event name
   * @param topic - MQTT topic
   * @param payload - Parsed message payload
   * @returns Event name to emit (e.g., 'mqtt/message/telemetry')
   * @throws Error if processing fails
   */
  handle(topic: string, payload: any): string;

  /**
   * Optional: Get handler priority (higher number = higher priority)
   * Useful when multiple handlers might match the same topic
   */
  getPriority?(): number;
}

/**
 * Handler Registry for managing multiple message handlers
 * Supports plugin architecture for adding new message types
 */
export interface IMqttMessageRouter {
  /**
   * Registers a new message handler
   * @param handler - Handler implementing IMqttMessageHandler
   */
  register(handler: IMqttMessageHandler): void;

  /**
   * Routes a message to appropriate handler
   * @param topic - MQTT topic
   * @param payload - Message payload
   * @returns Event name for the message
   * @throws Error if no handler found or handler fails
   */
  route(topic: string, payload: any): string;

  /**
   * Unregisters a handler
   * @param handlerClass - Handler class/type to remove
   */
  unregister(handlerClass: any): void;
}
