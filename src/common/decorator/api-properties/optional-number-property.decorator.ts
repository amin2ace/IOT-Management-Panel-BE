import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

/** The api property in type number
 * **Optional**
 * @type {number}
 */
export const OptionalNumberApiProperty = (
  apiPropertyOptions?: ApiPropertyOptions,
): PropertyDecorator =>
  applyDecorators(IsNumber(), IsOptional(), ApiProperty(apiPropertyOptions));
