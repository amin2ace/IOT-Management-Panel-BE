import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/** The ID of the device
 * **Required**
 * @type {string}
 */
export const DeviceIdProperty = (
  apiPropertyOptions?: ApiPropertyOptions,
): PropertyDecorator =>
  applyDecorators(
    IsString(),
    IsNotEmpty(),
    ApiProperty({
      description: 'Unique identifier of the device',
      example: 'sensor-67890',
      ...apiPropertyOptions,
    } as ApiPropertyOptions),
  );
