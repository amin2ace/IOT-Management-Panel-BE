import {
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class FilterDto {
  @IsOptional()
  @IsString()
  subnet?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hardware?: string[];
}

export class DiscoveryRequestDto {
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @IsNumber()
  @IsNotEmpty()
  requestCode: number; // Request Message Code

  @IsOptional()
  @IsString()
  deviceId?: string; // Request from specific device

  @IsISO8601()
  @IsNotEmpty()
  timestamp: string; // Epoch time: ISO8601

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
