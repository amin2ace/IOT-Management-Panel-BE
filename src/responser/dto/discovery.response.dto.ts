import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsObject,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { ConnectionState } from 'src/config/enum/connection-state.enum';
import { Protocol } from 'src/config/enum/protocol.enum';
import { DeviceCapabilities } from 'src/config/enum/sensor-type.enum';
import { DeviceLocationDto } from '../../device/dto/device-location.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidEpochMillis } from 'src/config/decorator/uptime-validation.decorator';
import { IsValidTimestampMillis } from 'src/config/decorator/timestamp-validation.decorator';
import { ResponseMessageCode } from '../../common/enum/response-message-code.enum';

export class AdditionalInfoDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  model?: string;
}

export class DiscoveryResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user who initiated the request',
    example: 'user-001',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Unique identifier for the response',
    example: 'fw-20251104-status',
  })
  @IsNotEmpty()
  @IsString()
  responseId: string;

  @ApiProperty({
    description: 'Response code from the device or system',
    example: ResponseMessageCode.RESPONSE_DISCOVERY,
  })
  @IsNotEmpty()
  @IsNumber()
  responseCode: number;

  @ApiProperty({
    description: 'Unique identifier for the request',
    example: 'req-d-79',
  })
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @ApiProperty({
    description: 'Device ID that performed the diagnostic',
    example: 'sensor-67890',
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isBroadcast: boolean;

  @ApiProperty({
    description: 'Time of diagnostic completion in epoch milliseconds',
    example: 1762379573804,
  })
  @IsValidTimestampMillis()
  @IsNotEmpty()
  timestamp: number;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  capabilities: DeviceCapabilities[]; // e.g. ["temperature", "humidity"]

  @ApiProperty()
  @IsString()
  deviceHardware: string;

  @ApiProperty()
  @IsString()
  topicPrefix: string; // like "sensors/<client>/temperature/<device>"

  @ApiProperty()
  @IsEnum(ConnectionState)
  connectionState: ConnectionState;

  @ApiProperty()
  @IsString()
  firmware: string;

  @ApiProperty()
  @IsString()
  mac: string;

  @ApiProperty()
  @IsString()
  ip: string;

  @IsValidEpochMillis({ message: 'Uptime must be valid epoch milliseconds' })
  uptime: number;

  @ApiProperty()
  @IsObject()
  location: DeviceLocationDto;

  @ApiProperty()
  @IsEnum(Protocol)
  protocol: Protocol;

  @ApiProperty()
  @IsString()
  broker: string;

  @ApiProperty()
  @IsOptional()
  @IsObject()
  additionalInfo?: AdditionalInfoDto;
}

/**
    Example:
      {
        "userId": "user-001",
        "responseId": "fw-20251104-status",
        "responseCode": 200,
        "requestId": "req-d-79",
        "deviceId": "sensor-67890",
        "isBroadcast": true,
        "timestamp": 1762379573804,
        "capabilities": ["temperature", "humidity", "pressure"],
        "deviceHardware": "ESP32-DevKitC",
        "topicPrefix": "sensors/lab01/temperature/sensor-67890",
        "connectionState": "online",
        "firmware": "v2.3.7",
        "mac": "00:1B:44:11:3A:B7",
        "ip": "192.168.1.45",
        "uptime": 1762379500000,
        "location": {
          "site": "main",
          "floor": 1,
          "unit": "tomato"
        },
        "protocol": "MQTT",
        "broker": "mqtt://broker.lab.local",
        "additionalInfo": {
          "manufacturer": "IoTTech Inc.",
          "model": "TX-9000"
        }
      }
 */
