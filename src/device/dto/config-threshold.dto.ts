import { MeasurementUnit } from '@/config/enum/measurement-unit.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ThresholdDto {
  @ApiProperty({
    description: 'High threshold value',
    example: 45,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  high?: number;

  @ApiProperty({
    description: 'Low threshold value',
    example: 20,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  low?: number;

  @ApiProperty({
    description: 'Measurement unit',
    example: MeasurementUnit.CELSIUS,
    required: false,
  })
  @IsOptional()
  @IsString()
  unit?: MeasurementUnit;
}
