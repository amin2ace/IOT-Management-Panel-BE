import { RequestMessageCode } from '@/common';
import {
  RequiredNumberApiProperty,
  RequiredStringApiProperty,
} from '@/common/decorator/api-properties';

export class RequestCacheDto {
  @RequiredStringApiProperty({
    description: 'Unique identifier of the user who initiated the request',
    example: 'user-001',
  })
  userId: string;

  @RequiredStringApiProperty({
    description: 'Unique identifier for the request',
    example: 'req-fu-41',
  })
  requestId: string;

  @RequiredNumberApiProperty({
    description: 'Numeric code representing the request type',
    example: RequestMessageCode.REQUEST_FIRMWARE_UPDATE,
  })
  requestCode: number; // Request Message Code
}
