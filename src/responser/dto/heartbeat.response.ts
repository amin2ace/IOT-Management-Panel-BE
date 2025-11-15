import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IsValidTimestampMillis } from 'src/config/decorator/timestamp-validation.decorator';
import { IsValidEpochMillis } from 'src/config/decorator/uptime-validation.decorator';
import { ConnectionState } from 'src/config/enum/connection-state.enum';
import { ResponseMessageCode } from '../../common/enum/response-message-code.enum';

export class HeartbeatDto {
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
    example: ResponseMessageCode.HEARTBEAT,
  })
  @IsNotEmpty()
  @IsNumber()
  responseCode: number;

  @ApiProperty({
    description: 'Unique identifier for the request',
    example: 'fw-20251104-0004',
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
  @IsEnum(ConnectionState)
  connectionState: ConnectionState;

  @IsValidEpochMillis({ message: 'Uptime must be valid epoch milliseconds' })
  uptime: number;

  @ApiProperty({
    description: 'Time of the request in epoch milli second',
    example: '1762379573804',
  })
  @IsValidTimestampMillis() // 5min behind, 30sec ahead
  timestamp: number;

  @ApiProperty({
    description: 'Wifi Received Signal Strength Indicator',
    example: '-52',
  })
  @IsString()
  @IsNotEmpty()
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
