import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { IsValidEpochMillis } from 'src/config/decorator/uptime-validation.decorator';
import { ConnectionState } from 'src/config/enum/connection-state.enum';
import {
  DeviceIdProperty,
  RequestIdProperty,
  RequiredNumberApiProperty,
  ResponseCodeProperty,
  ResponseIdProperty,
  TimeStampProperty,
  UserIdProperty,
} from '@/common/decorator/api-properties';
export class HeartbeatDto {
  @UserIdProperty()
  userId: string;

  @ResponseIdProperty()
  responseId: string;

  @ResponseCodeProperty()
  responseCode: number; // Request Message Code

  @RequestIdProperty()
  requestId: string; //"assign-20251104-0002",

  @DeviceIdProperty()
  deviceId: string; // Request from specific device

  @TimeStampProperty()
  timestamp: number;

  @ApiProperty()
  @IsEnum(ConnectionState)
  connectionState: ConnectionState;

  @IsValidEpochMillis({ message: 'Uptime must be valid epoch milliseconds' })
  uptime: number;

  @RequiredNumberApiProperty({
    description: 'Wifi Received Signal Strength Indicator',
    example: '-52',
  })
  wifiRssi: number;
}

/**
    Example:
      {
        "userId": "user-001",
        "responseId": "fw-20251104-status",
        "responseCode": 209,
        "requestId": "fw-20251104-0004",
        "deviceId": "sensor-67890",
        "connectionState": "CONNECTED",
        "uptime": 86400000,
        "timestamp": 1762379573804,
        "wifiRssi": -52
      }

 */
