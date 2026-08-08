import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { AckStatus } from 'src/config/enum/ack-status.enum';
import {
  DeviceIdProperty,
  RequestIdProperty,
  RequiredStringApiProperty,
  ResponseCodeProperty,
  ResponseIdProperty,
  TimeStampProperty,
  UserIdProperty,
} from '@/common/decorator/api-properties';

export class AckResponseDto {
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
    description: 'The acknowledgement state of the request',
    enum: AckStatus, // the enum itself
    enumName: 'AckStatus', // optional but helps Swagger
    example: [AckStatus.ACCEPTED], // optional example
  })
  @IsEnum(AckStatus)
  @IsNotEmpty()
  ackStatus: AckStatus; //"ACCEPTED",

  @RequiredStringApiProperty({
    description: 'Response message',
    example:
      'assigned TEMPERATURE, publishing to sensors/client-123/temperature/sensor-001',
  })
  details: string; //"assigned TEMPERATURE, publishing to sensors/client-123/temperature/sensor-001"
}

/**
    Example:
      {
        "userId": "user-001",
        "responseId": "res-12346",
        "responseCode": 202,
        "requestId": "req-12345",
        "deviceId": "sensor-67890",
        "ackStatus": "ACCEPTED",
        "timestamp": 1762379573804,
        "details": "Assigned TEMPERATURE metric successfully, publishing to sensors/client-123/temperature/sensor-001"
      }

 */
