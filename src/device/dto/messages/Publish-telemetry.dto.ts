import {
  DeviceIdProperty,
  RequestCodeProperty,
  RequestIdProperty,
  TimeStampProperty,
  UserIdProperty,
} from '@/common/decorator/api-properties';

export class PublishTelemetryDto {
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
}

/**
  Example:
    {
      "userId": "user-001",
      "requestCode": 111,
      "requestId": "fw-t-43",
      "deviceId": "sensor-67890",
      "timestamp": 1762379573804
    }
      
 */
