import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { SensorConfigDto } from '../configure/config-sensor.dto';
import {
  DeviceIdProperty,
  RequestCodeProperty,
  RequestIdProperty,
  TimeStampProperty,
  UserIdProperty,
} from '@/common/decorator/api-properties';

export class PublishSetDeviceConfigDto {
  @UserIdProperty()
  userId: string;

  @RequestIdProperty()
  requestId: string;

  @RequestCodeProperty()
  requestCode: string; // Request Message Code

  @DeviceIdProperty()
  deviceId: string;

  @TimeStampProperty()
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
