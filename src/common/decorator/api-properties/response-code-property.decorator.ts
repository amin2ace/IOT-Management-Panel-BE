import { RequestMessageCode } from '@/common/enum/request-message-code.enum';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/** The request code property of type enum
 * **Required**
 * @type {RequestMessageCode}
 */
export const ResponseCodeProperty = (
  apiPropertyOptions?: ApiPropertyOptions,
): PropertyDecorator =>
  applyDecorators(
    IsString(),
    IsNotEmpty(),
    ApiProperty({
      description: 'Numeric or enum code representing the request type',
      example: RequestMessageCode.REQUEST_SET_SENSOR_CONFIG,
      ...apiPropertyOptions,
    } as ApiPropertyOptions),
  );
