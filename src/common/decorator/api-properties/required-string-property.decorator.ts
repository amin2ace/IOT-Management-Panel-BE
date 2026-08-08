import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/** The api property in type string
 * **Required**
 * @type {string}
 */
export const RequiredStringApiProperty = (
  apiPropertyOptions?: ApiPropertyOptions,
): PropertyDecorator =>
  applyDecorators(IsString(), IsNotEmpty(), ApiProperty(apiPropertyOptions));
