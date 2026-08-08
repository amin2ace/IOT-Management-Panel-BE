import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/** The request ID property of type string
 * **Required**
 * @type {string}
 */
export const RequestIdProperty = (
  apiPropertyOptions?: ApiPropertyOptions,
): PropertyDecorator =>
  applyDecorators(
    IsString(),
    IsNotEmpty(),
    ApiProperty({
      description: 'Unique identifier for the request',
      example: 'req-ad-852',
      ...apiPropertyOptions,
    } as ApiPropertyOptions),
  );
