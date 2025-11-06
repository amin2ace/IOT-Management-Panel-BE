// src/device/dto/firmware-upgrade.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsUrl,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { IsValidTimestampMillis } from 'src/config/decorator/timestamp-validation.decorator';

export class FwUpgradeRequestDto {
  @ApiProperty({
    description: 'Unique identifier for the request',
    example: 'req-12345',
  })
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty({
    description: 'Numeric code representing the request type',
    example: 101,
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
    description: 'Target firmware version for the device',
    example: 'v1.2.3',
  })
  @IsString()
  version: string;

  @ApiProperty({
    description: 'URL to download the firmware binary',
    example: 'http://server.com/firmware/v1.2.3.bin',
  })
  @IsUrl({}, { message: 'Invalid URL format' })
  url: string;

  @ApiProperty({
    description: 'Size of firmware binary file in KB',
    example: 'http://server.com/firmware/v1.2.3.bin',
  })
  @IsNumber()
  @IsNotEmpty()
  size: number;

  @ApiProperty({
    description: 'Firmware binary file checksum in CRC32',
    example: '3F4A9B2C',
  })
  @IsString()
  @IsNotEmpty()
  checksum: string;

  @ApiProperty({
    description: 'A base64 signature to validate request source',
    example: 'U29tZVJhbmRvbUJhc2U2NFZhbHVl',
  })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({
    description: 'Optional release notes for this firmware version',
    required: false,
    example: 'Fixed sensor drift and improved connectivity.',
  })
  @IsOptional()
  @IsString()
  releaseNotes?: string;

  @ApiProperty({
    description: 'Whether the update should be applied immediately',
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  forceUpdate?: boolean;
}

/**
  Example:
  {
  "requestId": "fw-20251104-0004",
  "requestCode": 104,
  "deviceId": 'sensor-67890,
  "timestamp": "1762379573804",
  "version": "v1.3.0",
  "url": "https://files.example.com/firmware/client-123/T1000/v1.3.0.bin?sig=...",
  "size": 345678,
  "checksum": "3F4A9B2C",
  "signature": "U29tZVJhbmRvbUJhc2U2NFZhbHVl"
  "releaseNotes": "Fixed sensor drift and improved connectivity."
  "forceUpdate": false,
}
 */
