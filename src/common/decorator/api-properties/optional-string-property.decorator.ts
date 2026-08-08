import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/** The api property in type string
 * **Optional**
 * @type {string}
 */
export const OptionalStringApiProperty = (
  apiPropertyOptions?: ApiPropertyOptions,
): PropertyDecorator =>
  applyDecorators(IsString(), IsOptional(), ApiProperty(apiPropertyOptions));
