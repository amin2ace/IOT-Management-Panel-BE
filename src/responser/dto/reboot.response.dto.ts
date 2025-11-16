import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { IsValidTimestampMillis } from 'src/config/decorator/timestamp-validation.decorator';
import { RebootStatus } from 'src/config/enum/reboot-status.enum';
import { ResponseMessageCode } from '../../common/enum/response-message-code.enum';

export class DeviceRebootResponseDto {
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
    example: ResponseMessageCode.REBOOT_CONFIRMATION,
  })
  @IsNotEmpty()
  @IsNumber()
  responseCode: number;

  @ApiProperty({
    description: 'Unique identifier for the request',
    example: 'req-r-61',
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
    description: 'Status of the reboot request',
    enum: RebootStatus,
    example: RebootStatus.SUCCESS,
  })
  @IsEnum(RebootStatus)
  status: RebootStatus;

  @ApiProperty({
    description: 'Optional message with details or reason for failure',
    required: false,
    example: 'Reboot scheduled after current task completes',
  })
  @IsOptional()
  @IsString()
  message?: string;
}

/**
  Example:
    {
      "userId": "user-001",
      "responseId": "fw-20251104-status",
      "responseCode": 205,
      "requestId": "req-r-61",
      "deviceId": "sensor-67890",
      "timestamp": "1762379573804",
      "status": "SUCCESS",
      "message": "Reboot completed successfully"
    }

 */
