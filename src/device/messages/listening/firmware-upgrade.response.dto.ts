import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsNotEmpty } from 'class-validator';
import { IsValidTimestampMillis } from 'src/config/decorator/timestamp-validation.decorator';
import { UpgradeStatus } from 'src/config/enum/upgrade-status.enum';
import { ResponseMessageCode } from '../enum/response-message-code.enum';

export class FwUpgradeResponseDto {
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
    example: ResponseMessageCode.FIRMWARE_UPDATE_STATUS,
  })
  @IsNotEmpty()
  @IsNumber()
  responseCode: number;

  @ApiProperty({
    description: 'Unique identifier for the request',
    example: 'req-fu-41',
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

  @ApiProperty({
    description: 'Timestamp in milliseconds',
    example: '1762379573804',
  })
  @IsValidTimestampMillis()
  timestamp: string;

  @ApiProperty({
    description: 'Current status of the device operation',
    enum: UpgradeStatus,
    enumName: 'UpgradeStatus',
  })
  @IsEnum(UpgradeStatus)
  status: UpgradeStatus;

  @ApiProperty({
    description: 'Progress percentage of the operation',
    example: 12,
  })
  @IsNumber()
  progress: number;
}

/*
  Example:
    {
      "userId": "user-001",
      "responseId": "fw-20251104-status",
      "responseCode": 204,
      "requestId": "req-fu-41",
      "deviceId": "sensor-67890",
      "timestamp": "1762379573804",
      "status": "IN_PROGRESS",
      "progress": 12
    }
  **/
