import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class DeviceLocationDto {
  @ApiProperty({
    description: 'Site name',
    required: false,
    example: 'greenhouse-1',
  })
  @IsOptional()
  @IsString()
  site?: string;

  @ApiProperty({ description: 'Floor number', required: false, example: 1 })
  @IsOptional()
  @IsNumber()
  floor?: number;

  @ApiProperty({
    description: 'Unit or section',
    required: false,
    example: 'tomato-section',
  })
  @IsOptional()
  @IsString()
  unit?: string;
}
