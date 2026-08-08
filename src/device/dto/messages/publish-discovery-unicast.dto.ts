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
import { DiscoverFilterDto } from './publish-discovery-broadcast.dto';
import {
  DeviceIdProperty,
  RequestCodeProperty,
  RequestIdProperty,
  TimeStampProperty,
  UserIdProperty,
} from '@/common/decorator/api-properties';

export class PublishDiscoveryUnicastDto {
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
