import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class DeviceLocationDto {
  @ApiProperty({
    description: 'Site name',
    example: 'greenhouse-1',
    required: false,
  })
  @IsString()
  @IsOptional()
  site?: string;

  @ApiProperty({ description: 'Floor number', example: 1, required: false })
  @IsNumber()
  @IsOptional()
  floor?: number;

  @ApiProperty({
    description: 'Unit or section',
    example: 'tomato-section',
    required: false,
  })
  @IsString()
  @IsOptional()
  unit?: string;
}
