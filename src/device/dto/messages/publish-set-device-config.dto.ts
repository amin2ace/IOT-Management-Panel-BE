import { RequestMessageCode } from '@/common';
import { Protocol } from '@/config/enum/protocol.enum';
import { DeviceLocationDto } from '@/device/dto/device-location.dto';
import { LoggingConfigDto } from '@/device/dto/logging-config.dto';
import { NetworkConfigDto } from '@/device/dto/network-config.dto';
import { OtaConfigDto } from '@/device/dto/ota-config.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsTimeZone,
  ValidateNested,
} from 'class-validator';
import { IsValidTimestampMillis } from 'src/config/decorator/timestamp-validation.decorator';

export class PublishSetDeviceConfigDto {
  @ApiProperty({
    description: 'Unique identifier of the user who initiated the request',
    example: 'user-001',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Unique identifier for the request',
    example: 'req-sc-86',
  })
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty({
    description: 'Numeric code representing the request type',
    example: RequestMessageCode.SET_SENSOR_CONFIGURATION,
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
      "userId": "user-001",
      "requestId": "req-sc-86",
      "requestCode": 102,
      "deviceId": "sensor-67890",
      "timestamp": 1762379573804,
      "baseTopic": "greenHouse_jolfa/tomato-section/sensor/temperature",
      "network": {
        "ssid": "GreenHouseWiFi",
        "password": "securePass123",
        "ip": "192.168.1.50",
        "gateway": "192.168.1.1",
        "subnet": "255.255.255.0"
      },
      "timezone": "Asia/Tehran",
      "logging": {
        "level": "INFO",
        "remoteLogging": true,
        "logServer": "http://logs.example.com"
      },
      "ota": {
        "enabled": true,
        "serverUrl": "http://ota.example.com",
        "checkInterval": 3600000
      },
      "interval": 5000,
      "location": {
        "latitude": 38.276,
        "longitude": 46.289,
        "altitude": 1300
      },
      "protocol": "MQTT",
      "apSsid": "SensorAP-001",
      "apPassword": "strongpassword",
      "configVersion": 1
    }
 */
