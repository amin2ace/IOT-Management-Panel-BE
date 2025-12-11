import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { ConnectionState } from 'src/config/enum/connection-state.enum';
import { ProvisionState } from 'src/config/enum/provision-state.enum';
import { DeviceCapabilities } from 'src/config/enum/sensor-type.enum';
import { SensorConfigDto } from './sensor-config.dto';

/**
 * Sensor Response DTO
 * Used for serializing device/sensor data in API responses
 * Maps from Sensor entity to a clean response format
 */
export class SensorDto {
  @Expose()
  @ApiProperty({
    description: 'Unique sensor identifier (ESP MAC or custom ID)',
    example: 'sensor-67890',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @Expose()
  @ApiProperty({
    description: 'Device capabilities/supported functionalities',
    enum: DeviceCapabilities,
    isArray: true,
    example: [DeviceCapabilities.TEMPERATURE, DeviceCapabilities.HUMIDITY],
    required: true,
  })
  @IsEnum(DeviceCapabilities, { each: true })
  @IsNotEmpty()
  capabilities: DeviceCapabilities[];

  @Expose()
  @ApiProperty({
    description: 'Device hardware model or type',
    example: 'ESP32-WROOM',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  deviceHardware: string;

  @Expose()
  @ApiProperty({
    description: 'Device configuration',
  })
  configuration: SensorConfigDto;

  @Expose()
  @ApiProperty({
    description: 'Unique identifier of related controllers',
    type: 'array',
    example: ['controller-22', 'controller-55'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  controllers?: string[];

  @Expose()
  @ApiProperty({
    description: 'Assigned functionalities selected from capabilities',
    enum: DeviceCapabilities,
    isArray: true,
    example: [DeviceCapabilities.TEMPERATURE],
    required: false,
  })
  @IsOptional()
  @IsEnum(DeviceCapabilities, { each: true })
  assignedFunctionality?: DeviceCapabilities[];

  @Expose()
  @ApiProperty({
    description: 'Current provisioning state of the device',
    enum: ProvisionState,
    enumName: 'ProvisionState',
    example: ProvisionState.ACTIVE,
    required: true,
  })
  @IsEnum(ProvisionState)
  @IsNotEmpty()
  provisionState: ProvisionState;

  @Expose()
  @ApiProperty({
    description: 'Current connection state of the device',
    enum: ConnectionState,
    enumName: 'ConnectionState',
    example: ConnectionState.ONLINE,
    required: true,
  })
  @IsEnum(ConnectionState)
  connectionState: ConnectionState;

  @Expose()
  @ApiProperty({
    description: 'Whether the device is an actuator (controller) or sensor',
    example: false,
    required: true,
    default: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  isActuator: boolean;

  @Expose()
  @ApiProperty({
    description: 'Whether the device has an error state',
    example: false,
    required: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  hasError: boolean;

  @Expose()
  @ApiProperty({
    description: 'Device error Description if any has',
    required: false,
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @Expose()
  @ApiProperty({
    description: 'Last measured/reported value from the device',
    example: 25.5,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  lastValue?: number;

  @Expose()
  @ApiProperty({
    description: 'Timestamp of the last value update (epoch milliseconds)',
    example: 1762379573804,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  lastValueAt?: number;

  @Expose()
  @ApiProperty({
    description: 'Firmware version',
    example: 'v2.1.0',
    required: false,
  })
  @IsOptional()
  @IsString()
  firmware?: string;

  @Expose()
  @ApiProperty({
    description: 'MQTT broker address',
    example: 'mqtt.example.com:1883',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  broker: string;

  @Expose()
  @ApiProperty({
    description: 'Whether the device is marked as deleted',
    example: false,
    required: true,
    default: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  isDeleted: boolean;

  @Expose()
  @ApiProperty({
    description: 'Timestamp of last device reboot',
    example: '2025-11-14T10:30:00Z',
    required: false,
  })
  @IsOptional()
  lastReboot?: Date;

  @Expose()
  @ApiProperty({
    description: 'Timestamp of last firmware upgrade',
    example: '2025-11-10T14:20:00Z',
    required: false,
  })
  @IsOptional()
  lastUpgrade?: Date;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  @Exclude()
  _id?: any; // MongoDB ObjectId excluded from response
}

/**
  Example:
    {
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
          "unit": "tomato-section",
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
      "lastUpgrade": "2025-11-10T14:20:00.000Z",
    }
 */
