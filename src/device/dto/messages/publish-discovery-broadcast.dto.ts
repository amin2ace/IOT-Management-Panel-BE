import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  RequestCodeProperty,
  RequestIdProperty,
  TimeStampProperty,
  UserIdProperty,
} from '@/common/decorator/api-properties';

export class DiscoverFilterDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  subnet?: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hardware?: string[];
}

export class PublishDiscoveryBroadcastDto {
  @UserIdProperty()
  userId: string;

  @RequestIdProperty()
  requestId: string;

  @RequestCodeProperty()
  requestCode: string; // Request Message Code

  @TimeStampProperty()
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
      "timestamp": 1762379573804,
      "isBroadcast": true,
      "filters": {
        "subnet": "192.168.1.0/24",
        "hardware": ["ESP32", "ESP8266"]
      }
    }
 */
