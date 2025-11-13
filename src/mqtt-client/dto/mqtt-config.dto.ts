import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

/**
 * DTO for configuring MQTT broker connection options
 * @description Used to configure all MQTT connection parameters including
 * broker URL, port, authentication, and connection behavior settings
 */
export class MqttConfigDto {
  @ApiProperty({
    description: 'MQTT broker hostname or IP address',
    type: String,
    example: 'localhost',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  host: string;

  @ApiProperty({
    description: 'MQTT broker port number',
    type: Number,
    example: 1883,
    minimum: 1,
    maximum: 65535,
  })
  @IsNumber()
  @Min(1)
  @Max(65535)
  @IsNotEmpty()
  port: number;

  @ApiPropertyOptional({
    description: 'Protocol to use for connection (mqtt, mqtts, tcp, ws, wss)',
    type: String,
    example: 'mqtt',
    enum: ['mqtt', 'mqtts', 'tcp', 'ws', 'wss'],
  })
  @IsString()
  @IsOptional()
  protocol?: string;

  @ApiPropertyOptional({
    description: 'Username for MQTT broker authentication',
    type: String,
    example: 'admin',
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    description: 'Password for MQTT broker authentication',
    type: String,
    example: 'password123',
  })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    description: 'Client ID for the MQTT connection',
    type: String,
    example: 'iot-panel-client-001',
  })
  @IsString()
  @IsOptional()
  clientId?: string;

  @ApiPropertyOptional({
    description: 'Keep alive interval in seconds',
    type: Number,
    example: 60,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  keepalive?: number;

  @ApiPropertyOptional({
    description: 'Enable SSL/TLS encryption',
    type: Boolean,
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  ssl?: boolean;

  @ApiPropertyOptional({
    description: 'Path to CA certificate file (for SSL)',
    type: String,
    example: '/path/to/ca.crt',
  })
  @IsString()
  @IsOptional()
  ca?: string;

  @ApiPropertyOptional({
    description: 'Path to client certificate file',
    type: String,
    example: '/path/to/client.crt',
  })
  @IsString()
  @IsOptional()
  cert?: string;

  @ApiPropertyOptional({
    description: 'Path to client key file',
    type: String,
    example: '/path/to/client.key',
  })
  @IsString()
  @IsOptional()
  key?: string;

  @ApiPropertyOptional({
    description: 'Connection timeout in milliseconds',
    type: Number,
    example: 10000,
    minimum: 1000,
  })
  @IsNumber()
  @Min(1000)
  @IsOptional()
  connectTimeout?: number;

  @ApiPropertyOptional({
    description: 'Reconnection interval in milliseconds',
    type: Number,
    example: 5000,
    minimum: 1000,
  })
  @IsNumber()
  @Min(1000)
  @IsOptional()
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

  @ApiPropertyOptional({
    description: 'Maximum number of reconnection attempts',
    type: Number,
    example: 10,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxReconnectAttempts?: number;

  @ApiPropertyOptional({
    description: 'Will topic for last will message',
    type: String,
    example: 'device/status/offline',
  })
  @IsString()
  @IsOptional()
  willTopic?: string;

  @ApiPropertyOptional({
    description: 'Will message content',
    type: String,
    example: 'Device offline',
  })
  @IsString()
  @IsOptional()
  willMessage?: string;

  @ApiPropertyOptional({
    description: 'Will message QoS',
    type: Number,
    example: 1,
    minimum: 0,
    maximum: 2,
  })
  @IsNumber()
  @Min(0)
  @Max(2)
  @IsOptional()
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
