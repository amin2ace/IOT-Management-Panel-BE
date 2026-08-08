import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum } from 'class-validator';
import { UpgradeStatus } from 'src/config/enum/upgrade-status.enum';
import {
  DeviceIdProperty,
  RequestIdProperty,
  ResponseCodeProperty,
  ResponseIdProperty,
  TimeStampProperty,
  UserIdProperty,
} from '@/common/decorator/api-properties';
export class FwUpgradeResponseDto {
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
    description: 'Current status of the device operation',
    enum: UpgradeStatus,
    enumName: 'UpgradeStatus',
  })
  @IsEnum(UpgradeStatus)
  status: UpgradeStatus;

  @ApiProperty({
    description: 'Progress percentage of the operation',
    example: 12,
  })
  @IsNumber()
  progress: number;
}

/*
  Example:
    {
      "userId": "user-001",
      "responseId": "fw-20251104-status",
      "responseCode": 204,
      "requestId": "req-fu-41",
      "deviceId": "sensor-67890",
      "timestamp": "1762379573804",
      "status": "IN_PROGRESS",
      "progress": 12
    }
  **/
