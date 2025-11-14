import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Exclude } from 'class-transformer';
import { ConnectionState } from 'src/config/enum/connection-state.enum';
import { ProvisionState } from 'src/config/enum/provision-state.enum';
import { Protocol } from 'src/config/enum/protocol.enum';
import { DeviceCapabilities } from 'src/config/enum/sensor-type.enum';

/**
 * Sensor Response DTO
 * Used for serializing device/sensor data in API responses
 * Maps from Sensor entity to a clean response format
 */
export class SensorResponseDto {
  @ApiProperty({
    description: 'Unique sensor identifier (ESP MAC or custom ID)',
    example: 'sensor-67890',
  })
  @IsString()
  @IsNotEmpty()
  sensorId: string;

  @ApiProperty({
    description: 'Device capabilities/supported functionalities',
    enum: DeviceCapabilities,
    isArray: true,
    example: [DeviceCapabilities.TEMPERATURE, DeviceCapabilities.HUMIDITY],
  })
  @IsEnum(DeviceCapabilities, { each: true })
  @IsNotEmpty()
  capabilities: DeviceCapabilities[];

  @ApiProperty({
    description: 'Device hardware model or type',
    example: 'ESP32-WROOM',
  })
  @IsString()
  @IsNotEmpty()
  deviceHardware: string;

  @ApiProperty({
    description: 'Assigned functionalities selected from capabilities',
    enum: DeviceCapabilities,
    isArray: true,
    example: [DeviceCapabilities.TEMPERATURE],
    required: false,
  })
  @IsOptional()
  @IsEnum(DeviceCapabilities, { each: true })
  assignedFunctionality?: DeviceCapabilities[];

  @ApiProperty({
    description: 'Base MQTT topic for publishing device data',
    example: 'greenHouse_jolfa/tomato-section/sensor/temperature',
    required: false,
  })
  @IsOptional()
  @IsString()
  deviceBaseTopic?: string;

  @ApiProperty({
    description: 'Device location metadata',
    example: {
      room: 'Greenhouse',
      floor: 1,
      unit: 'tomato-section',
    },
    required: false,
  })
  @IsOptional()
  location?: Record<string, any>;

  @ApiProperty({
    description: 'Current provisioning state of the device',
    enum: ProvisionState,
    enumName: 'ProvisionState',
    example: ProvisionState.ACTIVE,
  })
  @IsEnum(ProvisionState)
  @IsNotEmpty()
  provisionState: ProvisionState;

  @ApiProperty({
    description: 'Client/tenant identifier for multi-tenant support',
    example: 'client-123',
    required: false,
  })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiProperty({
    description: 'Last measured/reported value from the device',
    example: 25.5,
  })
  @IsNumber()
  @IsNotEmpty()
  lastValue: number;

  @ApiProperty({
    description: 'Timestamp of the last value update (epoch milliseconds)',
    example: 1762379573804,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  lastValueAt?: number;

  @ApiProperty({
    description: 'Current connection state of the device',
    enum: ConnectionState,
    enumName: 'ConnectionState',
    example: ConnectionState.ONLINE,
    required: false,
  })
  @IsOptional()
  @IsEnum(ConnectionState)
  connectionState?: ConnectionState;

  @ApiProperty({
    description: 'Whether the device is an actuator (controller) or sensor',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  isActuator: boolean;

  @ApiProperty({
    description: 'High setpoint threshold',
    example: 30,
  })
  @IsNumber()
  @IsNotEmpty()
  highSetPoint: number;

  @ApiProperty({
    description: 'Low setpoint threshold',
    example: 15,
  })
  @IsNumber()
  @IsNotEmpty()
  lowSetPoint: number;

  @ApiProperty({
    description: 'Whether the device has an error state',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  hasError: boolean;

  @ApiProperty({
    description: 'Firmware version',
    example: 'v2.1.0',
    required: false,
  })
  @IsOptional()
  @IsString()
  firmware?: string;

  @ApiProperty({
    description: 'Device MAC address',
    example: '5C:CF:7F:12:34:56',
    required: false,
  })
  @IsOptional()
  @IsString()
  mac?: string;

  @ApiProperty({
    description: 'Device IP address',
    example: '192.168.1.50',
    required: false,
  })
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiProperty({
    description: 'Communication protocol used',
    enum: Protocol,
    enumName: 'Protocol',
    example: Protocol.MQTT,
  })
  @IsEnum(Protocol)
  @IsNotEmpty()
  protocol: Protocol;

  @ApiProperty({
    description: 'MQTT broker address',
    example: 'mqtt.example.com:1883',
  })
  @IsString()
  @IsNotEmpty()
  broker: string;

  @ApiProperty({
    description: 'Whether the device is marked as deleted',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  isDeleted: boolean;

  @ApiProperty({
    description: 'Timestamp of last device reboot',
    example: '2025-11-14T10:30:00Z',
    required: false,
  })
  @IsOptional()
  lastReboot?: Date;

  @ApiProperty({
    description: 'Timestamp of last firmware upgrade',
    example: '2025-11-10T14:20:00Z',
    required: false,
  })
  @IsOptional()
  lastUpgrade?: Date;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2025-01-15T08:00:00Z',
  })
  @IsNotEmpty()
  createdAt: Date;

  @ApiProperty({
    description: 'Record last update timestamp',
    example: '2025-11-14T10:35:00Z',
  })
  @IsNotEmpty()
  updatedAt: Date;

  @Exclude()
  _id?: any; // MongoDB ObjectId excluded from response
}
