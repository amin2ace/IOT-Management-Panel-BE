import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsEnum } from 'class-validator';
import { AckStatus } from 'src/config/enum/ack-status.enum';
import { DeviceCapabilities } from 'src/config/enum/sensor-type.enum';
import {
  DeviceIdProperty,
  RequestIdProperty,
  ResponseCodeProperty,
  ResponseIdProperty,
  UserIdProperty,
} from '@/common/decorator/api-properties';
export class SensorFunctionalityResponseDto {
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

  // @IsTimeStampProperty()
  // timestamp: number;

  @ApiProperty({
    description: 'Provisioned functionalities',
    enum: DeviceCapabilities,
    isArray: true,
    example: [DeviceCapabilities.TEMPERATURE],
  })
  @IsArray()
  @IsNotEmpty()
  functionality: DeviceCapabilities[];

  @ApiProperty({
    description: 'Provisioning status message',
    enum: AckStatus,
    example: AckStatus.ACCEPTED,
  })
  @IsEnum(AckStatus)
  status: AckStatus;
}

/**
    Example:
      {
        "userId": "user-001",
        "responseId": "fw-20251104-status",
        "responseCode": 201,
        "requestId": "req-sf-39",
        "deviceId": "sensor-67890",
        "functionality": ["TEMPERATURE"],
        "status": "accepted"
      }

 */
