import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum } from 'class-validator';
import { IsValidTimestampMillis } from 'src/config/decorator/timestamp-validation.decorator';

export class FwUpgradeResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the response',
    example: 'fw-20251104-status',
  })
  @IsString()
  responseId: string;

  @ApiProperty({
    description: 'Response code from the device or system',
    example: '204',
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
    description: 'Current status of the device operation',
  })
  @IsString()
  status: string;

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
    responsetId: 'fw-20251104-status',
    responseCode: '204',
    requestId: 'fw-20251104-0004',
    deviceId: 'sensor-67890',
    timestamp: '1762379573804',
    status: 'DOWNLOADING',
    progress: 12,
};
  **/
