import {
  RequiredNumberApiProperty,
  RequiredStringApiProperty,
} from '@/common/decorator/api-properties';
import { OptionalNumberApiProperty } from '@/common/decorator/api-properties/optional-number-property.decorator';
import { OptionalStringApiProperty } from '@/common/decorator/api-properties/optional-string-property.decorator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, Min, Max } from 'class-validator';

/**
 * DTO for configuring MQTT broker connection options
 * @description Used to configure all MQTT connection parameters including
 * broker URL, port, authentication, and connection behavior settings
 */
export class MqttConfigDto {
  @RequiredStringApiProperty({
    description: 'MQTT broker hostname or IP address',
    type: String,
    example: 'localhost',
    minLength: 1,
  })
  host: string;

  @RequiredNumberApiProperty({
    description: 'MQTT broker port number',
    type: Number,
    example: 1883,
    minimum: 1,
    maximum: 65535,
  })
  @Min(1)
  @Max(65535)
  port: number;

  @OptionalStringApiProperty({
    description: 'Protocol to use for connection (mqtt, mqtts, tcp, ws, wss)',
    type: String,
    example: 'mqtt',
    enum: ['mqtt', 'mqtts', 'tcp', 'ws', 'wss'],
  })
  protocol?: string;

  @OptionalStringApiProperty({
    description: 'Username for MQTT broker authentication',
    type: String,
    example: 'admin',
  })
  username?: string;

  @OptionalStringApiProperty({
    description: 'Password for MQTT broker authentication',
    type: String,
    example: 'password123',
  })
  password?: string;

  @OptionalStringApiProperty({
    description: 'Client ID for the MQTT connection',
    type: String,
    example: 'iot-panel-client-001',
  })
  clientId?: string;

  @OptionalNumberApiProperty({
    description: 'Keep alive interval in seconds',
    type: Number,
    example: 60,
    minimum: 1,
  })
  @Min(1)
  keepalive?: number;

  @ApiPropertyOptional({
    description: 'Enable SSL/TLS encryption',
    type: Boolean,
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  ssl?: boolean;

  @OptionalStringApiProperty({
    description: 'Path to CA certificate file (for SSL)',
    type: String,
    example: '/path/to/ca.crt',
  })
  ca?: string;

  @OptionalStringApiProperty({
    description: 'Path to client certificate file',
    type: String,
    example: '/path/to/client.crt',
  })
  cert?: string;

  @OptionalStringApiProperty({
    description: 'Path to client key file',
    type: String,
    example: '/path/to/client.key',
  })
  key?: string;

  @OptionalNumberApiProperty({
    description: 'Connection timeout in milliseconds',
    type: Number,
    example: 10000,
    minimum: 1000,
  })
  @Min(1000)
  connectTimeout?: number;

  @OptionalNumberApiProperty({
    description: 'Reconnection interval in milliseconds',
    type: Number,
    example: 5000,
    minimum: 1000,
  })
  @Min(1000)
  reconnectPeriod?: number;

  @ApiPropertyOptional({
    description: 'Clean session flag',
    type: Boolean,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  clean?: boolean;

  @ApiPropertyOptional({
    description: 'Auto reconnect on connection failure',
    type: Boolean,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  autoReconnect?: boolean;

  @OptionalNumberApiProperty({
    description: 'Maximum number of reconnection attempts',
    type: Number,
    example: 10,
    minimum: 1,
  })
  @Min(1)
  maxReconnectAttempts?: number;

  @OptionalStringApiProperty({
    description: 'Will topic for last will message',
    type: String,
    example: 'device/status/offline',
  })
  willTopic?: string;

  @OptionalStringApiProperty({
    description: 'Will message content',
    type: String,
    example: 'Device offline',
  })
  willMessage?: string;

  @OptionalNumberApiProperty({
    description: 'Will message QoS',
    type: Number,
    example: 1,
    minimum: 0,
    maximum: 2,
  })
  @Min(0)
  @Max(2)
  willQos?: number;

  @ApiPropertyOptional({
    description: 'Will message retain flag',
    type: Boolean,
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  willRetain?: boolean;
}
