/**
 * MQTT Response DTOs
 *
 * Provides type-safe response objects for all MQTT operations
 * Follows Interface Segregation Principle - each operation has specific return type
 * Improves code clarity and IDE autocomplete support
 */

import { ApiProperty } from '@nestjs/swagger';

/**
 * Response when subscription operation completes
 */
export class SubscriptionResult {
  @ApiProperty({ description: 'Operation success status' })
  success: boolean;

  @ApiProperty({ description: 'MQTT topic path' })
  topics: string | string[];

  @ApiProperty({ description: 'Operation description or error message' })
  description: string;

  @ApiProperty({ description: 'Operation timestamp' })
  timestamp: Date;

  @ApiProperty({
    description: 'Individual subscription results (for batch operations)',
    isArray: true,
    required: false,
  })
  results?: Array<{
    topic: string;
    success: boolean;
    error?: string;
  }>;
}

/**
 * Response when publish operation completes
 */
export class PublishResult {
  @ApiProperty({ description: 'Operation success status' })
  success: boolean;

  @ApiProperty({ description: 'MQTT topic where message was published' })
  topic: string;

  @ApiProperty({ description: 'Published message payload' })
  payload: string;

  @ApiProperty({ description: 'Operation description' })
  description: string;

  @ApiProperty({ description: 'Operation timestamp' })
  timestamp: Date;

  @ApiProperty({
    description: 'Message ID if broker returned one',
    required: false,
  })
  messageId?: string;
}

/**
 * Response when unsubscription operation completes
 */
export class UnsubscriptionResult {
  @ApiProperty({ description: 'Operation success status' })
  success: boolean;

  @ApiProperty({ description: 'MQTT topic that was unsubscribed' })
  topic: string;

  @ApiProperty({
    description: 'Error message if operation failed',
    required: false,
  })
  error?: string;

  @ApiProperty({ description: 'Operation timestamp' })
  timestamp: Date;
}

/**
 * Current MQTT connection status
 */
export class ConnectionStatusDto {
  @ApiProperty({ description: 'Is currently connected to broker' })
  connected: boolean;

  @ApiProperty({ description: 'Broker URL/hostname' })
  brokerUrl: string;

  @ApiProperty({
    description: 'List of topics currently subscribed to',
    isArray: true,
  })
  subscribedTopics: string[];

  @ApiProperty({ description: 'Status timestamp' })
  timestamp: Date;

  @ApiProperty({
    description: 'Client ID connected to broker',
    required: false,
  })
  clientId?: string;

  @ApiProperty({
    description: 'Number of connection attempts',
    required: false,
  })
  connectionAttempts?: number;
}

/**
 * Configuration retrieval response
 */
export class ConfigurationResult {
  @ApiProperty({ description: 'MQTT broker hostname/IP' })
  host: string;

  @ApiProperty({ description: 'MQTT broker port' })
  port: number;

  @ApiProperty({ description: 'Connection protocol' })
  protocol: string;

  @ApiProperty({ description: 'Client ID used for connection' })
  clientId: string;

  @ApiProperty({ description: 'Keep-alive interval in seconds' })
  keepalive: number;

  @ApiProperty({ description: 'Clean session flag' })
  clean: boolean;

  @ApiProperty({ description: 'Auto-reconnect enabled' })
  autoReconnect: boolean;

  @ApiProperty({ description: 'Number of connection attemps' })
  connectAtempts: number;

  @ApiProperty({ description: 'Maximum number of attemts to connect' })
  maxConnectionAttempts: number;

  @ApiProperty({ description: 'Current connection status' })
  connected: boolean;

  @ApiProperty({ description: 'Retrieved timestamp' })
  timestamp: Date;
}

/**
 * Configuration validation result
 */
export class ConfigurationValidationResult {
  @ApiProperty({ description: 'Configuration is valid' })
  valid: boolean;

  @ApiProperty({ description: 'Validation message', required: false })
  message?: string;

  @ApiProperty({
    description: 'List of validation errors',
    isArray: true,
    required: false,
  })
  errors?: string[];
}

/**
 * Connection test result
 */
export class ConnectionTestResult {
  @ApiProperty({ description: 'Connection test succeeded' })
  success: boolean;

  @ApiProperty({ description: 'Test result message' })
  message: string;

  @ApiProperty({
    description: 'Broker information if successfully connected',
    required: false,
  })
  brokerInfo?: {
    clientId: string | null;
    protocol: string;
    host: string;
    port: number;
  };

  @ApiProperty({ description: 'Test timestamp' })
  timestamp: Date;

  @ApiProperty({
    description: 'Connection duration in milliseconds',
    required: false,
  })
  duration?: number;
}

/**
 * Reconnection result
 */
export class ReconnectionResult {
  @ApiProperty({ description: 'Reconnection was initiated successfully' })
  success: boolean;

  @ApiProperty({ description: 'Result message' })
  message: string;

  @ApiProperty({ description: 'Operation timestamp' })
  timestamp: Date;
}
