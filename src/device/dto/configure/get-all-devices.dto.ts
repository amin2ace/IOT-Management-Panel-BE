import { OptionalNumberApiProperty } from '@/common/decorator/api-properties/optional-number-property.decorator';
import { SensorDto } from '@/device/dto/configure/sensor.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional } from 'class-validator';

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
  @OptionalNumberApiProperty({
    description: 'Total number of devices in the system',
    example: 42,
  })
  total?: number;

  @Expose()
  @OptionalNumberApiProperty({
    description: 'Current page number (for pagination)',
    example: 1,
  })
  page?: number;

  @Expose()
  @OptionalNumberApiProperty({
    description: 'Number of devices per page',
    example: 10,
  })
  limit?: number;

  @Expose()
  @OptionalNumberApiProperty({
    description: 'Total number of pages',
    example: 5,
  })
  totalPages?: number;

  @Expose()
  @ApiProperty({
    description: 'Whether there are more pages available',
    example: false,
  })
  @IsOptional()
  hasMore?: boolean;
}
