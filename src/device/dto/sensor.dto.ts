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
import { DeviceCapabilities } from 'src/config/enum/sensor-type.enum';
import { SensorConfigDto } from './sensor-config.dto';

/**
 * Sensor Response DTO
 * Used for serializing device/sensor data in API responses
 * Maps from Sensor entity to a clean response format
 */
export class SensorDto {
  @ApiProperty({
    description: 'Unique sensor identifier (ESP MAC or custom ID)',
    example: 'sensor-67890',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({
    description: 'Device capabilities/supported functionalities',
    enum: DeviceCapabilities,
    isArray: true,
    example: [DeviceCapabilities.TEMPERATURE, DeviceCapabilities.HUMIDITY],
    required: true,
  })
  @IsEnum(DeviceCapabilities, { each: true })
  @IsNotEmpty()
  capabilities: DeviceCapabilities[];

  @ApiProperty({
    description: 'Device hardware model or type',
    example: 'ESP32-WROOM',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  deviceHardware: string;

  @ApiProperty({
    description: 'Device configuration',
  })
  configuration: SensorConfigDto;

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
    description: 'Current provisioning state of the device',
    enum: ProvisionState,
    enumName: 'ProvisionState',
    example: ProvisionState.ACTIVE,
    required: true,
  })
  @IsEnum(ProvisionState)
  @IsNotEmpty()
  provisionState: ProvisionState;

  @ApiProperty({
    description: 'Current connection state of the device',
    enum: ConnectionState,
    enumName: 'ConnectionState',
    example: ConnectionState.ONLINE,
    required: true,
  })
  @IsEnum(ConnectionState)
  connectionState: ConnectionState;

  @ApiProperty({
    description: 'Last measured/reported value from the device',
    example: 25.5,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  lastValue?: number;

  @ApiProperty({
    description: 'Timestamp of the last value update (epoch milliseconds)',
    example: 1762379573804,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  lastValueAt?: number;

  @ApiProperty({
    description: 'Whether the device is an actuator (controller) or sensor',
    example: false,
    required: true,
    default: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  isActuator: boolean;

  @ApiProperty({
    description: 'Whether the device has an error state',
    example: false,
    required: true,
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
    description: 'MQTT broker address',
    example: 'mqtt.example.com:1883',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  broker: string;

  @ApiProperty({
    description: 'Whether the device is marked as deleted',
    example: false,
    required: true,
    default: false,
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
    required: true,
  })
  @IsNotEmpty()
  createdAt: Date;

  @ApiProperty({
    description: 'Record last update timestamp',
    example: '2025-11-14T10:35:00Z',
    required: true,
  })
  @IsNotEmpty()
  updatedAt: Date;

  @Exclude()
  _id?: any; // MongoDB ObjectId excluded from response
}

/**
    Example:
 */
