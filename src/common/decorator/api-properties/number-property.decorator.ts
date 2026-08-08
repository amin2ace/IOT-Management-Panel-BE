import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

/** The api property in type number
 * **Required**
 * @type {number}
 */
export const RequiredNumberApiProperty = (
  apiPropertyOptions?: ApiPropertyOptions,
): PropertyDecorator =>
  applyDecorators(IsNumber(), IsNotEmpty(), ApiProperty(apiPropertyOptions));
