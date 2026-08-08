import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/** The user ID property of type string
 * **Required**
 * @type {string}
 */
export const UserIdProperty = (
  apiPropertyOptions?: ApiPropertyOptions,
): PropertyDecorator =>
  applyDecorators(
    IsString(),
    IsNotEmpty(),
    ApiProperty({
      description: 'Unique identifier of the user who initiated the request',
      example: 'user-001',
      ...apiPropertyOptions,
    } as ApiPropertyOptions),
  );
