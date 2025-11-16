import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { IsValidTimestampMillis } from 'src/config/decorator/timestamp-validation.decorator';
import { AckStatus } from 'src/config/enum/ack-status.enum';
import { ResponseMessageCode } from '../../common/enum/response-message-code.enum';
import { Type } from 'class-transformer';
import { DeviceLocationDto } from '../../device/dto/device-location.dto';
import { Protocol } from 'src/config/enum/protocol.enum';
import { NetworkConfigDto } from '../../device/dto/network-config.dto';
import { LoggingConfigDto } from '../../device/dto/logging-config.dto';
import { OtaConfigDto } from '../../device/dto/ota-config.dto';

export class SensorConfigResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user who initiated the request',
    example: 'user-001',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Unique identifier for the response',
    example: 'res-sc-86',
  })
  @IsString()
  @IsNotEmpty()
  responseId: string;

  @ApiProperty({
    description: 'Numeric code representing the response type',
    example: ResponseMessageCode.SENSOR_CONFIGURATION_ACKNOWLEDGEMENT,
  })
  @IsNumber()
  @IsNotEmpty()
  responseCode: number; // Response Message Code

  @ApiProperty({
    description: 'Unique identifier for the original request',
    example: 'req-sc-86',
  })
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty({
    description: 'Unique identifier of the device',
    example: 'sensor-67890',
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty({
    description: 'The acknowledgement state of the configuration request',
    enum: AckStatus,
    enumName: 'AckStatus',
    example: AckStatus.ACCEPTED,
  })
  @IsEnum(AckStatus)
  @IsNotEmpty()
  ackStatus: AckStatus;

  @ApiProperty({
    description: 'Time of the response in epoch milli second',
    example: '1762379573804',
  })
  @IsValidTimestampMillis()
  @IsNotEmpty()
  timestamp: number;

  @ApiProperty({
    description: 'Base MQTT topic for the device',
    example: 'greenHouse_jolfa/tomato-section/sensor/temperature',
  })
  @IsString()
  @IsOptional()
  baseTopic?: string;

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
  @IsString()
  @IsOptional()
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
  interval?: number;

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
    description: 'Protocol name in use',
    enum: Protocol,
    enumName: 'Protocol',
    example: Protocol.MQTT,
    required: false,
  })
  @IsOptional()
  @IsEnum(Protocol)
  protocol?: Protocol;

  @ApiProperty({
    description: 'Access point SSID',
    example: 'SensorAP-001',
    required: false,
  })
  @IsOptional()
  @IsString()
  apSsid?: string;

  @ApiProperty({
    description: 'Configuration version for tracking updates',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  configVersion?: number;

  @ApiProperty({
    description: 'Response message with configuration status details',
    example:
      'Sensor configuration accepted and applied successfully. All settings have been updated.',
  })
  @IsString()
  @IsNotEmpty()
  details: string;
}

/**
  Example Response:
    {
      "userId": "user-001",
      "responseId": "res-sc-86",
      "responseCode": 102,
      "requestId": "req-sc-86",
      "deviceId": "sensor-67890",
      "ackStatus": "ACCEPTED",
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
      "configVersion": 1,
      "details": "Sensor configuration accepted and applied successfully. All settings have been updated."
    }
 */
