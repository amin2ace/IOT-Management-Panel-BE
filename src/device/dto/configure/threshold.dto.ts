import { OptionalNumberApiProperty } from '@/common/decorator/api-properties/optional-number-property.decorator';
import { OptionalStringApiProperty } from '@/common/decorator/api-properties/optional-string-property.decorator';
import { MeasurementUnit } from '@/config/enum/measurement-unit.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ThresholdDto {
  @OptionalNumberApiProperty({
    description: 'High threshold value',
    example: 45,
    required: false,
  })
  high?: number;

  @OptionalNumberApiProperty({
    description: 'Low threshold value',
    example: 20,
    required: false,
  })
  low?: number;

  @OptionalStringApiProperty({
    description: 'Measurement unit',
    example: MeasurementUnit.CELSIUS,
    required: false,
  })
  unit?: MeasurementUnit;
}
