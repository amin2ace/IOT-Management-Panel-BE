// src/device/dto/firmware-upgrade.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, IsBoolean } from 'class-validator';
import {
  DeviceIdProperty,
  RequestCodeProperty,
  RequestIdProperty,
  RequiredNumberApiProperty,
  RequiredStringApiProperty,
  TimeStampProperty,
  UserIdProperty,
} from '@/common/decorator/api-properties';
import { OptionalStringApiProperty } from '@/common/decorator/api-properties/optional-string-property.decorator';

export class PublishFwUpgradeDto {
  @UserIdProperty()
  userId: string;

  @RequestIdProperty()
  requestId: string;

  @RequestCodeProperty()
  requestCode: string; // Request Message Code

  @DeviceIdProperty()
  deviceId: string;

  @TimeStampProperty()
  timestamp: number;

  @RequiredStringApiProperty({
    description: 'Target firmware version for the device',
    example: 'v1.2.3',
  })
  version: string;

  @ApiProperty({
    description: 'URL to download the firmware binary',
    example: 'http://server.com/firmware/v1.2.3.bin',
  })
  @IsUrl({}, { message: 'Invalid URL format' })
  url: string;

  @RequiredNumberApiProperty({
    description: 'Size of firmware binary file in KB',
    example: 'http://server.com/firmware/v1.2.3.bin',
  })
  size: number;

  @RequiredStringApiProperty({
    description: 'Firmware binary file checksum in CRC32',
    example: '3F4A9B2C',
  })
  checksum: string;

  @RequiredStringApiProperty({
    description: 'A base64 signature to validate request source',
    example: 'U29tZVJhbmRvbUJhc2U2NFZhbHVl',
  })
  signature: string;

  @OptionalStringApiProperty({
    description: 'Optional release notes for this firmware version',
    required: false,
    example: 'Fixed sensor drift and improved connectivity.',
  })
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
      "userId": "user-001",
      "requestId": "req-fu-41",
      "requestCode": 104,
      "deviceId": "sensor-67890",
      "timestamp": 1762379573804,
      "version": "v1.2.3",
      "url": "http://server.com/firmware/v1.2.3.bin",
      "size": 5120,
      "checksum": "3F4A9B2C",
      "signature": "U29tZVJhbmRvbUJhc2U2NFZhbHVl",
      "releaseNotes": "Fixed sensor drift and improved connectivity.",
      "forceUpdate": false
    }
 */
