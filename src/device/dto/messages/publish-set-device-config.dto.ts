import { RequestMessageCode } from '@/common';
import { Protocol } from '@/config/enum/protocol.enum';
import { DeviceLocationDto } from '@/device/dto/config-device-location.dto';
import { LoggingConfigDto } from '@/device/dto/config-logging.dto';
import { NetworkConfigDto } from '@/device/dto/config-network.dto';
import { OtaConfigDto } from '@/device/dto/config-ota.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
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
import { SensorConfigDto } from '../sensor-config.dto';

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
    example: RequestMessageCode.REQUEST_SET_SENSOR_CONFIG,
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

  @Expose()
  @ApiProperty({
    description: 'Device configuration',
  })
  configuration: SensorConfigDto;
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
