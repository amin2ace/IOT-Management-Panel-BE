import { ResponseMessageCode } from '@/common/enum/response-message-code.enum';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/** The request code property of type enum
 * **Required**
 * @type {ResponseMessageCode}
 */
export const RequestCodeProperty = (
  apiPropertyOptions?: ApiPropertyOptions,
): PropertyDecorator =>
  applyDecorators(
    IsString(),
    IsNotEmpty(),
    ApiProperty({
      description: 'Numeric code representing the response type',
      example: ResponseMessageCode.RESPONSE_SET_SENSOR_CONFIG,
      ...apiPropertyOptions,
    } as ApiPropertyOptions),
  );
