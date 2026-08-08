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
import { DeviceLocationDto } from './device-location.dto';
import {
  DeviceIdProperty,
  RequiredNumberApiProperty,
  RequiredStringApiProperty,
} from '@/common/decorator/api-properties';
import { OptionalStringApiProperty } from '@/common/decorator/api-properties/optional-string-property.decorator';
import { OptionalNumberApiProperty } from '@/common/decorator/api-properties/optional-number-property.decorator';

export class QuerySensorDto {
  @Expose()
  @DeviceIdProperty()
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
  @OptionalStringApiProperty()
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
  @OptionalStringApiProperty()
  clientId?: string;

  @Expose()
  @IsNumber()
  lastValue: number;

  @Expose()
  @OptionalNumberApiProperty()
  lastValueAt?: number;

  @Expose()
  @IsOptional()
  @IsEnum(ConnectionState)
  connectionState?: ConnectionState;

  @Expose()
  @IsBoolean()
  isActuator: boolean;

  @Expose()
  @RequiredNumberApiProperty()
  highSetPoint: number;

  @Expose()
  @RequiredNumberApiProperty()
  lowSetPoint: number;

  @Expose()
  @RequiredNumberApiProperty()
  interval: number;

  @Expose()
  @IsBoolean()
  hasError: boolean;

  @Expose()
  @OptionalStringApiProperty()
  firmware?: string;

  @Expose()
  @OptionalStringApiProperty()
  mac?: string;

  @Expose()
  @OptionalStringApiProperty()
  ip?: string;

  @Expose()
  @IsEnum(Protocol)
  protocol: Protocol;

  @Expose()
  @RequiredStringApiProperty()
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
