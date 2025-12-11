import { SensorDto } from '@/device/dto/sensor.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

/**
 * Get All Devices Response DTO
 * Used for serializing the response when fetching all devices/sensors
 * Includes array of devices and optional pagination metadata
 */
export class GetAllDevicesDto {
  @Expose()
  @ApiProperty({
    description: 'Array of device/sensor records',
    type: [SensorDto],
  })
  @IsArray()
  @IsNotEmpty()
  data: SensorDto[];

  @Expose()
  @ApiProperty({
    description: 'Total number of devices in the system',
    example: 42,
  })
  @IsNumber()
  @IsOptional()
  total?: number;

  @Expose()
  @ApiProperty({
    description: 'Current page number (for pagination)',
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  page?: number;

  @Expose()
  @ApiProperty({
    description: 'Number of devices per page',
    example: 10,
  })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @Expose()
  @ApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  @IsNumber()
  @IsOptional()
  totalPages?: number;

  @Expose()
  @ApiProperty({
    description: 'Whether there are more pages available',
    example: false,
  })
  @IsOptional()
  hasMore?: boolean;
}
