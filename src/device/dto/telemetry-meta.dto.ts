import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { DeviceLocationDto } from './config-device-location.dto';
import { Type } from 'class-transformer';

export class TelemetryMetaDto {
  @ApiProperty({
    description: 'Firmware version of the device',
    example: 'v1.2.3',
    required: false,
  })
  @IsOptional()
  @IsString()
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

  @ApiProperty({
    description: 'Optional comment',
    example: 'Near greenhouse',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
