import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, ValidateNested } from 'class-validator';
import { DeviceLocationDto } from './device-location.dto';
import { Type } from 'class-transformer';
import { OptionalStringApiProperty } from '@/common/decorator/api-properties/optional-string-property.decorator';

export class TelemetryMetaDto {
  @OptionalStringApiProperty({
    description: 'Firmware version of the device',
    example: 'v1.2.3',
    required: false,
  })
  firmwareVersion?: string;

  @ApiProperty({
    description: 'Device location',
    required: false,
    type: DeviceLocationDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceLocationDto)
  location?: DeviceLocationDto;

  @OptionalStringApiProperty({
    description: 'Optional comment',
    example: 'Near greenhouse',
    required: false,
  })
  comment?: string;
}
