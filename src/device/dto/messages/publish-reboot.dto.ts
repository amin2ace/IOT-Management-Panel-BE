// src/device/dto/device-reboot-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import {
  DeviceIdProperty,
  RequestCodeProperty,
  RequestIdProperty,
  TimeStampProperty,
  UserIdProperty,
} from '@/common/decorator/api-properties';
import { OptionalStringApiProperty } from '@/common/decorator/api-properties/optional-string-property.decorator';

export class PublishDeviceRebootDto {
  @UserIdProperty()
  userId: string;

  @RequestIdProperty()
  requestId: string;

  @RequestCodeProperty()
  requestCode: string; // Request Message Code

  @DeviceIdProperty()
  deviceId: string;

  @TimeStampProperty()
  timestamp: number;

  @OptionalStringApiProperty({
    description: 'Reason for requesting the reboot',
    required: false,
    example: 'Firmware update required',
  })
  reason?: string;
}

/**
  Example:
    {
      "userId": "user-001",
      "requestId": "req-r-61",
      "requestCode": 105,
      "deviceId": "sensor-67890",
      "timestamp": 1762379573804,
      "reason": "Firmware update required"
    }


 */
