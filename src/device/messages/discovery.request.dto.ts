import {
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidTimestampMillis } from 'src/config/decorator/timestamp-validation.decorator';

class FilterDto {
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

export class DiscoveryRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  requestCode: number; // Request Message Code

  @ApiProperty()
  @IsOptional()
  @IsString()
  deviceId?: string; // Request from specific device

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isBroadcast: boolean;

  @ApiProperty({
    description: 'Time of the request in epoch milli second',
    example: '1762379573804',
  })
  @IsValidTimestampMillis() // 5min behind, 30sec ahead
  timestamp: number;

  @ApiProperty()
  @IsOptional()
  @ValidateNested()
  @Type(() => FilterDto)
  filters?: FilterDto;
}

// mock data for discovery request:
/**
 * {
 *   "requestId": "123e4567-e89b-12d3-a456-426614174000",
 *   "deviceId": "device-001",
 *   "requestCode": 0,
 *   "timestamp": "2024-10-01T12:00:00Z",
 *   "filters": {
 *     "subnet": "192.168.1.0/24",
 *     "hardware": ["sensor", "camera"]
 *   }
 */
