// src/devices/dto/sensor-response.dto.ts
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsString,
  IsArray,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsDate,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { DeviceCapabilities } from 'src/config/enum/sensor-type.enum';
import { ProvisionState } from 'src/config/enum/provision-state.enum';
import { ConnectionState } from 'src/config/enum/connection-state.enum';
import { Protocol } from 'src/config/enum/protocol.enum';
import { DeviceLocationDto } from './config-device-location.dto';

export class QuerySensorDto {
  @Expose()
  @IsString()
  deviceId: string;

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
  @Type(() => DeviceLocationDto)
  @ValidateNested()
  @IsObject()
  location: DeviceLocationDto;

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
  @IsNumber()
  interval: number;

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
  @IsBoolean()
  @Transform(({ value }) => value ?? false)
  isDeleted: boolean;

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
