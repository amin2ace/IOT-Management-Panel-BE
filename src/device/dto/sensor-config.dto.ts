import { DeviceLocationDto } from '@/device/dto/device-location.dto';
import { LoggingConfigDto } from '@/device/dto/logging-config.dto';
import { NetworkConfigDto } from '@/device/dto/network-config.dto';
import { OtaConfigDto } from '@/device/dto/ota-config.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsTimeZone,
  ValidateNested,
} from 'class-validator';
import { Protocol } from '@/config/enum/protocol.enum';
import { ThresholdDto } from '@/device/dto/threshold.dto';

export class SensorConfigDto {
  @ApiProperty({
    description: 'Unique identifier of the sensor',
    example: 'sensor-67890',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string; // Request from specific device

  @ApiProperty({
    description: 'Unique identifier of related controllers',
    type: 'array',
    example: ['controller-22', 'controller-55'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  controllersId?: string[];

  @ApiProperty({
    description: 'Device high and low set points',
    type: ThresholdDto,
  })
  @ValidateNested()
  @Type(() => ThresholdDto)
  @IsOptional()
  threshold?: ThresholdDto;

  @ApiProperty({
    description: 'Base MQTT topic for the device',
    example: 'greenHouse_jolfa/tomato-section/sensor/temperature',
  })
  @IsString()
  @IsOptional()
  baseTopic?: string; // like "greenHouse_jolfa/tomato-section/sensor/temperature"

  @ApiProperty({
    description: 'Network configuration',
    type: NetworkConfigDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => NetworkConfigDto)
  network?: NetworkConfigDto;

  @ApiProperty({
    description: 'Device timezone',
    example: 'Asia/Tehran',
    required: false,
  })
  @IsOptional()
  @IsTimeZone()
  timezone?: string;

  @ApiProperty({
    description: 'Logging configuration',
    type: LoggingConfigDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LoggingConfigDto)
  logging?: LoggingConfigDto;

  @ApiProperty({
    description: 'OTA configuration',
    type: OtaConfigDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OtaConfigDto)
  ota?: OtaConfigDto;

  @ApiProperty({
    description: 'Data publishing interval in milliseconds',
    example: 5000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  interval?: number; // e.g. 5000 for 5 seconds

  @ApiProperty({
    description: 'Device location',
    type: DeviceLocationDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceLocationDto)
  location?: DeviceLocationDto;

  @ApiProperty({
    description: 'Protocol name to use',
    enum: Protocol,
    enumName: 'Protocol',
    example: Protocol.MQTT,
    required: false,
  })
  @IsOptional()
  @IsEnum(Protocol)
  protocol?: Protocol;

  @ApiProperty({
    description: 'Configuration version for update tracking',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  configVersion?: number;
}

/**
  Example:
 */
