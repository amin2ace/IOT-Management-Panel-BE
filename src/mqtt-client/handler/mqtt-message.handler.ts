/**
 * Abstract Base Message Handler
 *
 * Base class for all MQTT message handlers
 * Provides common functionality and enforces handler contract
 */

import { Logger } from '@nestjs/common';
import { IMqttMessageHandler } from '@/mqtt-client/interface/message-handler.interface';

/**
 * Base class for all message handlers
 * Implements common validation and logging
 */
export abstract class BaseMqttMessageHandler implements IMqttMessageHandler {
  protected logger = new Logger(this.constructor.name, { timestamp: true });

  /**
   * Topic suffix to match (e.g., '/telemetry', '/discovery')
   * Subclasses should override this
   */
  protected abstract topicSuffix: string;

  /**
   * Default priority for this handler
   * Higher number = higher priority when multiple handlers match
   */
  protected priority: number = 0;

  /**
   * Determines if this handler can process the message
   * @param topic - MQTT topic
   * @returns True if topic ends with the handler's suffix
   */
  canHandle(topic: string): boolean {
    return topic?.endsWith(this.topicSuffix) ?? false;
  }

  /**
   * Abstract method - subclasses must implement
   * @param topic - MQTT topic
   * @param payload - Parsed message payload
   * @returns Event name to emit
   */
  abstract handle(topic: string, payload: any): string;

  /**
   * Get handler priority
   * @returns Priority number
   */
  getPriority(): number {
    return this.priority;
  }

  /**
   * Validates payload structure
   * @param payload - Payload to validate
   * @throws Error if payload is invalid
   */
  protected validatePayload(payload: any): void {
    if (payload === null || payload === undefined) {
      throw new Error('Payload cannot be null or undefined');
    }
    if (typeof payload !== 'object') {
      throw new Error('Payload must be a JSON object');
    }
  }

  /**
   * Logs message processing (debug level)
   * @param topic - MQTT topic
   * @param eventName - Event name being emitted
   */
  protected logProcessing(topic: string, eventName: string): void {
    this.logger.debug(`Processing ${topic} as ${eventName}`);
  }
}

/**
 * Discovery Message Handler
 * Handles device discovery messages
 */
export class DiscoveryMessageHandler extends BaseMqttMessageHandler {
  protected topicSuffix = '/discovery';
  protected priority = 10;

  handle(topic: string, payload: any): string {
    this.validatePayload(payload);
    this.logProcessing(topic, 'mqtt/message/discovery');
    return 'mqtt/message/discovery';
  }
}

/**
 * Assignment Message Handler
 * Handles device assignment messages
 */
export class AssignmentMessageHandler extends BaseMqttMessageHandler {
  protected topicSuffix = '/assign';
  protected priority = 10;

  handle(topic: string, payload: any): string {
    this.validatePayload(payload);
    this.logProcessing(topic, 'mqtt/message/assign');
    return 'mqtt/message/assign';
  }
}

/**
 * Acknowledgment Message Handler
 * Handles device acknowledgment messages
 */
export class AcknowledgeMessageHandler extends BaseMqttMessageHandler {
  protected topicSuffix = '/ack';
  protected priority = 10;

  handle(topic: string, payload: any): string {
    this.validatePayload(payload);
    this.logProcessing(topic, 'mqtt/message/ack');
    return 'mqtt/message/ack';
  }
}

/**
 * Firmware Upgrade Message Handler
 * Handles firmware upgrade notification messages
 */
export class FirmwareUpgradeMessageHandler extends BaseMqttMessageHandler {
  protected topicSuffix = '/upgrade';
  protected priority = 10;

  handle(topic: string, payload: any): string {
    this.validatePayload(payload);
    this.logProcessing(topic, 'mqtt/message/upgrade');
    return 'mqtt/message/upgrade';
  }
}

/**
 * Heartbeat Message Handler
 * Handles device heartbeat/keep-alive messages
 */
export class HeartbeatMessageHandler extends BaseMqttMessageHandler {
  protected topicSuffix = '/heartbeat';
  protected priority = 5; // Lower priority than other handlers

  handle(topic: string, payload: any): string {
    this.validatePayload(payload);
    this.logProcessing(topic, 'mqtt/message/heartbeat');
    return 'mqtt/message/heartbeat';
  }
}

/**
 * Reboot Message Handler
 * Handles device reboot notification messages
 */
export class RebootMessageHandler extends BaseMqttMessageHandler {
  protected topicSuffix = '/reboot';
  protected priority = 10;

  handle(topic: string, payload: any): string {
    this.validatePayload(payload);
    this.logProcessing(topic, 'mqtt/message/reboot');
    return 'mqtt/message/reboot';
  }
}

/**
 * Telemetry Message Handler
 * Handles device telemetry/sensor data messages
 */
export class TelemetryMessageHandler extends BaseMqttMessageHandler {
  protected topicSuffix = '/telemetry';
  protected priority = 8;

  handle(topic: string, payload: any): string {
    this.validatePayload(payload);
    this.logProcessing(topic, 'mqtt/message/telemetry');
    return 'mqtt/message/telemetry';
  }
}

/**
 * Hardware Status Message Handler
 * Handles hardware status/diagnostic messages
 */
export class HardwareStatusMessageHandler extends BaseMqttMessageHandler {
  protected topicSuffix = '/hardware_status';
  protected priority = 8;

  handle(topic: string, payload: any): string {
    this.validatePayload(payload);
    this.logProcessing(topic, 'mqtt/message/hardware-status');
    return 'mqtt/message/hardware-status';
  }
}

/**
 * Alert Message Handler
 * Handles alert/warning messages from devices
 */
export class AlertMessageHandler extends BaseMqttMessageHandler {
  protected topicSuffix = '/alert';
  protected priority = 15; // Higher priority - alerts should be processed first

  handle(topic: string, payload: any): string {
    this.validatePayload(payload);
    this.logProcessing(topic, 'mqtt/message/alert');
    return 'mqtt/message/alert';
  }
}
