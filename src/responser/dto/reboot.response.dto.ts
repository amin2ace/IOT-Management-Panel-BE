import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { RebootStatus } from 'src/config/enum/reboot-status.enum';
import {
  DeviceIdProperty,
  OptionalStringApiProperty,
  RequestIdProperty,
  ResponseCodeProperty,
  ResponseIdProperty,
  TimeStampProperty,
  UserIdProperty,
} from '@/common/decorator/api-properties';
export class DeviceRebootResponseDto {
  @UserIdProperty()
  userId: string;

  @ResponseIdProperty()
  responseId: string;

  @ResponseCodeProperty()
  responseCode: number; // Request Message Code

  @RequestIdProperty()
  requestId: string; //"assign-20251104-0002",

  @DeviceIdProperty()
  deviceId: string; // Request from specific device

  @TimeStampProperty()
  timestamp: number;

  @ApiProperty({
    description: 'Status of the reboot request',
    enum: RebootStatus,
    example: RebootStatus.SUCCESS,
  })
  @IsEnum(RebootStatus)
  status: RebootStatus;

  @OptionalStringApiProperty({
    description: 'Optional message with details or reason for failure',
    required: false,
    example: 'Reboot scheduled after current task completes',
  })
  message?: string;
}

/**
  Example:
    {
      "userId": "user-001",
      "responseId": "fw-20251104-status",
      "responseCode": 205,
      "requestId": "req-r-61",
      "deviceId": "sensor-67890",
      "timestamp": "1762379573804",
      "status": "SUCCESS",
      "message": "Reboot completed successfully"
    }

 */
