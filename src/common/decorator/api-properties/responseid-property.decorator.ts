import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/** The response ID property of type string
 * **Required**
 * @type {string}
 */
export const ResponseIdProperty = (
  apiPropertyOptions?: ApiPropertyOptions,
): PropertyDecorator =>
  applyDecorators(
    IsString(),
    IsNotEmpty(),
    ApiProperty({
      description: 'Unique identifier for the response',
      example: 'res-12346',
      ...apiPropertyOptions,
    } as ApiPropertyOptions),
  );
