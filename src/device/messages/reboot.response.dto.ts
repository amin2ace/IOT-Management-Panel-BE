// src/device/dto/device-reboot-response.dto.ts
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

export class DeviceRebootResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the response',
    example: 'fw-20251104-status',
  })
  @IsString()
  responseId: string;

  @ApiProperty({
    description: 'Response code from the device or system',
    example: '205',
  })
  @IsString()
  responseCode: string;

  @ApiProperty({
    description: 'Unique identifier for the request',
    example: 'fw-20251104-0004',
  })
  @IsString()
  requestId: string;

  @ApiProperty({
    description: 'Identifier of the device',
    example: 'sensor-67890',
  })
  @IsString()
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
      "responseId": "fw-20251104-status",
      "responseCode": "205",
      "requestId": "fw-20251104-0004",
      "deviceId": "sensor-67890",
      "timestamp": "1762379573804",
      "status": "success",
      "message": "Device rebooted successfully"
    }

 */
