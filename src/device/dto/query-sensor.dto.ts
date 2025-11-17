import { Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';
import { DeviceCapabilities } from 'src/config/enum/sensor-type.enum';
import { ProvisionState } from 'src/config/enum/provision-state.enum';
import { ConnectionState } from 'src/config/enum/connection-state.enum';
import { Protocol } from 'src/config/enum/protocol.enum';

/**
 * Nested DTO for device location
 */
export class LocationResponseDto {
  @Expose()
  @IsOptional()
  @IsString()
  room?: string;

  @Expose()
  @IsOptional()
  @IsNumber()
  floor?: number;

  @Expose()
  @IsOptional()
  @IsString()
  unit?: string;
}

/**
 * Main Sensor Serialization DTO
 */
export class QuerySensorDto {
  @Expose()
  @IsString()
  id: string; // mapped from _id.toString()

  @Expose()
  @IsString()
  sensorId: string;

  @Expose()
  @IsArray()
  @IsEnum(DeviceCapabilities, { each: true })
  capabilities: DeviceCapabilities[];

  @Expose()
  @IsString()
  deviceHardware: string;

  @Expose()
  @IsOptional()
  @IsArray()
  @IsEnum(DeviceCapabilities, { each: true })
  assignedFunctionality?: DeviceCapabilities[];

  @Expose()
  @IsOptional()
  @IsString()
  deviceBaseTopic?: string;

  @Expose()
  @IsObject()
  @Type(() => LocationResponseDto)
  location: LocationResponseDto;

  @Expose()
  @IsEnum(ProvisionState)
  provisionState: ProvisionState;

  @Expose()
  @IsOptional()
  @IsString()
  clientId?: string;

  @Expose()
  @IsNumber()
  lastValue: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  lastValueAt?: number;

  @Expose()
  @IsOptional()
  @IsEnum(ConnectionState)
  connectionState?: ConnectionState;

  @Expose()
  @IsBoolean()
  isActuator: boolean;

  @Expose()
  @IsNumber()
  highSetPoint: number;

  @Expose()
  @IsNumber()
  lowSetPoint: number;

  @Expose()
  @IsBoolean()
  hasError: boolean;

  @Expose()
  @IsOptional()
  @IsString()
  firmware?: string;

  @Expose()
  @IsOptional()
  @IsString()
  mac?: string;

  @Expose()
  @IsOptional()
  @IsString()
  ip?: string;

  @Expose()
  @IsEnum(Protocol)
  protocol: Protocol;

  @Expose()
  @IsString()
  broker: string;

  @Expose()
  @IsOptional()
  @IsDate()
  lastReboot?: Date;

  @Expose()
  @IsOptional()
  @IsDate()
  lastUpgrade?: Date;

  @Expose()
  @IsDate()
  createdAt: Date;

  @Expose()
  @IsDate()
  updatedAt: Date;
}
