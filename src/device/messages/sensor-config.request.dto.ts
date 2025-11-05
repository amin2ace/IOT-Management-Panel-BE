import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsTimeZone,
  ValidateNested,
} from 'class-validator';
import { IsValidTimestampMillis } from 'src/config/decorator/timestamp-validation.decorator';
import { DeviceLocationDto } from '../dto/device-location.dto';
import { Protocol } from 'src/config/enum/protocol.enum';
import { Type } from 'class-transformer';
import { NetworkConfigDto } from '../dto/network-config.dto';
import { LoggingConfigDto } from '../dto/logging-config.dto';
import { OtaConfigDto } from '../dto/ota-config.dto';

export class SensorConfigRequestDto {
  @ApiProperty({
    description: 'Unique identifier for the request',
    example: 'req-12345',
  })
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty({
    description: 'Numeric code representing the request type',
    example: 101,
  })
  @IsNumber()
  @IsNotEmpty()
  requestCode: number; // Request Message Code

  @ApiProperty({
    description: 'Unique identifier of the device',
    example: 'sensor-67890',
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string; // Request from specific device

  @ApiProperty({
    description: 'Time of the request in epoch milli second',
    example: '1762379573804',
  })
  @IsValidTimestampMillis() // 5min behind, 30sec ahead
  @IsNotEmpty()
  timestamp: number;

  @ApiProperty({
    description: 'Base MQTT topic for the device',
    example: 'greenHouse_jolfa/tomato-section/sensor/temperature',
  })
  @IsString()
  @IsOptional()
  baseTopic?: string; // like "greenHouse_jolfa/tomato-section/sensor/temperature"

  @ApiProperty({ description: 'Network configuration', type: NetworkConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => NetworkConfigDto)
  network?: NetworkConfigDto;

  @ApiProperty({
    description: 'Device timezone',
    required: false,
    example: 'Asia/Tehran',
  })
  @IsOptional()
  @IsTimeZone()
  timezone?: string;

  @ApiProperty({
    description: 'Logging configuration',
    required: false,
    type: LoggingConfigDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LoggingConfigDto)
  logging?: LoggingConfigDto;

  @ApiProperty({
    description: 'OTA configuration',
    required: false,
    type: OtaConfigDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OtaConfigDto)
  ota?: OtaConfigDto;

  @ApiProperty({
    description: 'Data publishing interval in milliseconds',
    example: 5000,
  })
  @IsOptional()
  @IsNumber()
  interval?: number; // e.g. 5000 for 5 seconds

  @ApiProperty({
    description: 'Device location',
    required: false,
    type: DeviceLocationDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceLocationDto)
  location?: DeviceLocationDto;

  @ApiProperty({
    description: 'Protocol name to use',
    required: false,
    enum: Protocol,
    enumName: 'Protocol',
    example: Protocol.MQTT,
  })
  @IsOptional()
  @IsEnum(Protocol)
  protocol?: Protocol;

  @ApiProperty()
  @IsOptional()
  @IsString()
  apSsid?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 0,
    minNumbers: 0,
    minSymbols: 0,
    minUppercase: 0,
  })
  apPassword?: string; // TODO: Access point password policy

  @ApiProperty({
    description: 'Configuration version for update tracking',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  configVersion?: number;
}

/**
  Example:
    {
      "requestId": "config-20251104-0003",
      "timestamp": "2025-11-04T10:10:00Z",
      "config": {
        "intervalMs": 10000,
        "thresholds": {
          "temperature": { "min": -5, "max": 45 },
          "humidity": { "min": 20, "max": 90 }
        },
        "reporting": { "format": "compact", "includeMeta": true }
      },
      "version": "v1.2",
      "signature": "base64"
    }
 */
