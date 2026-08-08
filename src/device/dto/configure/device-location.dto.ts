import { OptionalNumberApiProperty } from '@/common/decorator/api-properties/optional-number-property.decorator';
import { OptionalStringApiProperty } from '@/common/decorator/api-properties/optional-string-property.decorator';

export class DeviceLocationDto {
  @OptionalStringApiProperty({
    description: 'Site name',
    example: 'greenhouse-1',
    required: false,
  })
  site?: string;

  @OptionalNumberApiProperty({
    description: 'Floor number',
    example: 1,
    required: false,
  })
  floor?: number;

  @OptionalStringApiProperty({
    description: 'Unit or section',
    example: 'tomato-section',
    required: false,
  })
  unit?: string;
}
