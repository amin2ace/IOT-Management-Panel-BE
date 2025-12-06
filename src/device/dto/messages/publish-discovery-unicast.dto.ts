import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidTimestampMillis } from 'src/config/decorator/timestamp-validation.decorator';
import { RequestMessageCode } from '@/common';
import { DiscoverFilterDto } from './publish-discovery-broadcast.dto';

export class PublishDiscoveryUnicastDto {
  @ApiProperty({
    description: 'Unique identifier of the user who initiated the request',
    example: 'user-001',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Unique identifier for the request',
    example: 'req-d-79',
  })
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty({
    description: 'Numeric code representing the request type',
    example: RequestMessageCode.DISCOVERY,
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

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isBroadcast: boolean;

  @ApiProperty({
    description: 'Time of the request in epoch milli second',
    example: {
      subnet: '192.168.1.0/24',
      hardware: ['ESP32', 'ESP8266'],
    },
  })
  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => DiscoverFilterDto)
  filters?: DiscoverFilterDto;
}

/*
  Example:
    {
      "userId": "user-001",
      "requestId": "req-d-79",
      "requestCode": 100,
      "deviceId": "sensor-12345",
      "timestamp": 1762379573804,
      "isBroadcast": false,
      "filters": {
        "subnet": "192.168.1.0/24",
        "hardware": ["ESP32", "ESP8266"]
      }
    }
 */
