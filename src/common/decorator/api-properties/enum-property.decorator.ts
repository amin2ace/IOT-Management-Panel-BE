import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { EnumAllowedTypes } from 'node_modules/@nestjs/swagger/dist/interfaces/schema-object-metadata.interface';

/**
 * @todo must implement this and update dtos
 * @param apiPropertyOptions
 * @returns
 */
export const RequiredEnumApiProperty = (
  apiPropertyOptions: ApiPropertyOptions,
): PropertyDecorator =>
  applyDecorators(
    IsNotEmpty(),
    ApiProperty(apiPropertyOptions),
    IsEnum(apiPropertyOptions.enum as EnumAllowedTypes),
  );
