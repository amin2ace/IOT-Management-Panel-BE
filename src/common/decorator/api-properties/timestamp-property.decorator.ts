import { IsValidTimestampMillis } from '@/config/decorator/timestamp-validation.decorator';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/** The api property of timestamp - epoch
 * **Required**
 */
export const TimeStampProperty = (
  apiPropertyOptions?: ApiPropertyOptions,
): PropertyDecorator =>
  applyDecorators(
    IsValidTimestampMillis(),
    IsNotEmpty(),
    ApiProperty({
      description: 'Time of the request in epoch milli second',
      example: '1762379573804',
      ...apiPropertyOptions,
    } as ApiPropertyOptions),
  );
