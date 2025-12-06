// src/device/dto/device-reboot-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { IsValidTimestampMillis } from 'src/config/decorator/timestamp-validation.decorator';
import { RequestMessageCode } from '../../../common/enum/request-message-code.enum';

export class PublishDeviceRebootDto {
  @ApiProperty({
    description: 'Unique identifier of the user who initiated the request',
    example: 'user-001',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Unique identifier for the request',
    example: 'req-r-61',
  })
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty({
    description: 'Numeric code representing the request type',
    example: RequestMessageCode.REBOOT_COMMAND,
  })
  @IsNumber()
  @IsNotEmpty()
  requestCode: number; // Request Message Code

  @ApiProperty({
    description: 'Unique identifier of the device',
    example: 'sensor-67890',
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string; // Request from specific device

  @ApiProperty({
    description: 'Time of the request in epoch milli second',
    example: '1762379573804',
  })
  @IsValidTimestampMillis() // 5min behind, 30sec ahead
  @IsNotEmpty()
  timestamp: number;

  @ApiProperty({
    description: 'Reason for requesting the reboot',
    required: false,
    example: 'Firmware update required',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
  Example:
    {
      "userId": "user-001",
      "requestId": "req-r-61",
      "requestCode": 105,
      "deviceId": "sensor-67890",
      "timestamp": 1762379573804,
      "reason": "Firmware update required"
    }


 */
