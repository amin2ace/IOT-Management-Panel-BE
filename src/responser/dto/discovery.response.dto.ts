import { IsOptional, IsObject, IsNotEmpty, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidEpochMillis } from 'src/config/decorator/uptime-validation.decorator';
import { SensorDto } from '@/device/dto/configure/sensor.dto';

import {
  OptionalStringApiProperty,
  RequestIdProperty,
  ResponseCodeProperty,
  ResponseIdProperty,
  TimeStampProperty,
  UserIdProperty,
} from '@/common/decorator/api-properties';
export class AdditionalInfoDto {
  @OptionalStringApiProperty()
  manufacturer?: string;

  @OptionalStringApiProperty()
  model?: string;
}

export class DiscoveryResponseDto {
  @UserIdProperty()
  userId: string;

  @ResponseIdProperty()
  responseId: string;

  @ResponseCodeProperty()
  responseCode: number; // Request Message Code

  @RequestIdProperty()
  requestId: string; //"assign-20251104-0002",

  @TimeStampProperty()
  timestamp: number;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isBroadcast: boolean;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  sensorData: SensorDto;

  @IsValidEpochMillis({ message: 'Uptime must be valid epoch milliseconds' })
  uptime: number;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  additionalInfo?: AdditionalInfoDto;
}

/**
  Example:
    {
      "userId": "user-001",
      "responseId": "discovery-resp-20241115-001",
      "responseCode": 200,
      "requestId": "req-discovery-79",
      "isBroadcast": false,
      "timestamp": 1762379573804,
      "sensorData": {
        "deviceId": "esp32-sensor-001",
        "capabilities": ["temperature", "humidity"],
        "deviceHardware": "ESP32-WROOM-32D",
        "configuration": {
          "deviceId": "esp32-sensor-001",
          "timestamp": 1762379573804,
          "baseTopic": "greenhouse/production/tomato-section/sensor/temperature",
          "network": {
            "wifiSsid": "Greenhouse_Production_WiFi",
            "wifiPassword": "SecurePass123!",
            "dhcp": true,
            "ip": "192.168.1.100",
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
            "baudrate": 115200,
            "externalServer": "https://log-server.company.com:8888"
          },
          "ota": {
            "enabled": true,
            "url": "https://firmware.company.com/ota/esp32-sensor-001.bin",
            "checkInterval": 3600000
          },
          "interval": 10000,
          "location": {
            "site": "greenhouse-1",
            "floor": 1,
            "unit": "tomato-section"
          },
          "threshold": {
            "high": 30.0,
            "low": 15.0,
            "unit": "°C"
          },
          "protocol": "MQTT",
          "configVersion": 3,
          "customSettings": {
            "samplingRate": "high",
            "calibrationOffset": 0.5,
            "alarmEnabled": true
          }
        },
        "controllers": ["controller-22", "controller-55"],
        "assignedFunctionality": ["temperature"],
        "provisionState": "ACTIVE",
        "connectionState": "ONLINE",
        "isActuator": false,
        "hasError": false,
        "errorMessage": "Sensor calibration needed",
        "lastValue": 25.5,
        "lastValueAt": 1762379573804,
        "firmware": "v2.1.0",
        "broker": "mqtt.broker.com:1883",
        "isDeleted": false,
        "lastReboot": "2025-11-14T10:30:00.000Z",
        "lastUpgrade": "2025-11-10T14:20:00.000Z"
      },
      "uptime": 3600000,
      "additionalInfo": {
        "manufacturer": "Espressif Systems",
        "model": "ESP32-WROOM-32D v1.1"
      }
    }

     
 */
