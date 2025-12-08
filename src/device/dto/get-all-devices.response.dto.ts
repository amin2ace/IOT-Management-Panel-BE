import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { SensorDto } from './sensor.dto';

/**
 * Get All Devices Response DTO
 * Used for serializing the response when fetching all devices/sensors
 * Includes array of devices and optional pagination metadata
 */
export class GetAllDevicesResponseDto {
  @ApiProperty({
    description: 'Array of device/sensor records',
    type: [SensorDto],
  })
  @IsArray()
  @IsNotEmpty()
  data: SensorDto[];

  @ApiProperty({
    description: 'Total number of devices in the system',
    example: 42,
  })
  @IsNumber()
  @IsOptional()
  total?: number;

  @ApiProperty({
    description: 'Current page number (for pagination)',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: 'Number of devices per page',
    example: 10,
  })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  @IsNumber()
  @IsOptional()
  totalPages?: number;

  @ApiProperty({
    description: 'Whether there are more pages available',
    example: false,
  })
  @IsOptional()
  hasMore?: boolean;
}
