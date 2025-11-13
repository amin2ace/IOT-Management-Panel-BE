/**
 * MQTT Message Router
 *
 * Implements the Strategy Pattern for handling different message types
 * Allows easy addition of new message handlers without modifying existing code
 * Follows Open/Closed Principle
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  IMqttMessageHandler,
  IMqttMessageRouter,
} from '@/mqtt-client/interface/message-handler.interface';

@Injectable()
export class MqttMessageRouter implements IMqttMessageRouter {
  private readonly logger = new Logger(MqttMessageRouter.name);
  private handlers: Map<string, IMqttMessageHandler> = new Map();

  /**
   * Registers a new message handler
   * @param handler - Handler implementing IMqttMessageHandler
   */
  register(handler: IMqttMessageHandler): void {
    const handlerName = handler.constructor.name;
    this.handlers.set(handlerName, handler);
    this.logger.log(`Registered message handler: ${handlerName}`);
  }

  /**
   * Unregisters a handler by class name
   * @param handlerClass - Handler class/type to remove
   */
  unregister(handlerClass: any): void {
    const handlerName = handlerClass.name;
    const removed = this.handlers.delete(handlerName);
    if (removed) {
      this.logger.log(`Unregistered message handler: ${handlerName}`);
    }
  }

  /**
   * Routes a message to the appropriate handler
   * @param topic - MQTT topic
   * @param payload - Message payload
   * @returns Event name for the message
   * @throws Error if no handler found or handler fails
   */
  route(topic: string, payload: any): string {
    // Sort handlers by priority (higher priority first)
    const sortedHandlers = Array.from(this.handlers.values()).sort((a, b) => {
      const priorityA = a.getPriority?.() ?? 0;
      const priorityB = b.getPriority?.() ?? 0;
      return priorityB - priorityA;
    });

    // Find first handler that can handle the topic
    for (const handler of sortedHandlers) {
      if (handler.canHandle(topic)) {
        try {
          return handler.handle(topic, payload);
        } catch (error) {
          this.logger.error(
            `Handler ${handler.constructor.name} failed to process topic ${topic}: ${error.message}`,
          );
          throw error;
        }
      }
    }

    // No handler found - return unknown event
    this.logger.warn(`No handler found for topic: ${topic}`);
    return 'mqtt/message/unknown';
  }

  /**
   * Gets all registered handlers
   * @returns List of handler names
   */
  getRegisteredHandlers(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Clears all handlers
   */
  clear(): void {
    this.handlers.clear();
    this.logger.log('Cleared all message handlers');
  }
}
