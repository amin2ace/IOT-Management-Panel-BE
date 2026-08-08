import { DeviceLocationDto } from '@/device/dto/configure/device-location.dto';
import { LoggingConfigDto } from '@/device/dto/configure/logging.dto';
import { NetworkConfigDto } from '@/device/dto/configure/network.dto';
import { OtaConfigDto } from '@/device/dto/configure/ota.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsTimeZone,
  ValidateNested,
} from 'class-validator';
import { Protocol } from '@/config/enum/protocol.enum';
import { ThresholdDto } from '@/device/dto/configure/threshold.dto';
import { DeviceIdProperty } from '@/common/decorator/api-properties';
import { OptionalStringApiProperty } from '@/common/decorator/api-properties/optional-string-property.decorator';
import { OptionalNumberApiProperty } from '@/common/decorator/api-properties/optional-number-property.decorator';

export class SensorConfigDto {
  @DeviceIdProperty()
  deviceId: string; // Request from specific device

  @ApiProperty({
    description: 'Device high and low set points',
    type: ThresholdDto,
  })
  @ValidateNested()
  @Type(() => ThresholdDto)
  @IsOptional()
  threshold?: ThresholdDto;

  @OptionalStringApiProperty({
    description: 'Base MQTT topic for the device',
    example: 'greenHouse_jolfa/tomato-section/sensor/temperature',
  })
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

  @OptionalNumberApiProperty({
    description: 'Data publishing interval in milliseconds',
    example: 5000,
    required: false,
  })
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

  @OptionalNumberApiProperty({
    description: 'Configuration version for update tracking',
    example: 1,
    required: false,
  })
  configVersion?: number;
}

/**
  Example:
    {
      "deviceId": "esp32-env-sensor-001",
      "threshold": {
        "high": 35.0,
        "low": 10.0,
        "unit": "°C"
      },
      "baseTopic": "greenhouse/production/tomato-section/sensor/environment",
      "network": {
        "wifiSsid": "Greenhouse_WiFi_2.4G",
        "wifiPassword": "SecurePassword123!",
        "dhcp": false,
        "ip": "192.168.1.150",
        "subnetMask": "255.255.255.0",
        "gateway": "192.168.1.1",
        "dnsServer1": "192.168.1.1",
        "dnsServer2": "8.8.8.8",
        "accessPointSsid": "ESP32-Config-AP-001",
        "accessPointPassword": "ConfigMode123"
      },
      "timezone": "Asia/Tehran",
      "logging": {
        "level": "INFO",
        "enableSerial": true,
        "buadrate": 115200,
        "externalServer": "https://logs.company.com:8080"
      },
      "ota": {
        "enabled": true,
        "url": "https://ota-server.company.com/firmware/esp32-v2.5.1.bin",
        "checkInterval": 3600000
      },
      "interval": 10000,
      "location": {
        "site": "greenhouse-main",
        "floor": 1,
        "unit": "tomato-section-a"
      },
      "protocol": "MQTT",
      "configVersion": 3
    }
 */
