import { IsValidEpochMillis } from 'src/config/decorator/uptime-validation.decorator';
import {
  DeviceIdProperty,
  RequestIdProperty,
  RequiredNumberApiProperty,
  ResponseCodeProperty,
  ResponseIdProperty,
  TimeStampProperty,
  UserIdProperty,
} from '@/common/decorator/api-properties';
export class HardwareStatusResponseDto {
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

  @RequiredNumberApiProperty({
    description: 'Memory usage in KB',
    example: '232500',
  })
  memoryUsage: number;

  @RequiredNumberApiProperty({
    description: 'CPU usage in percent',
    example: '32',
  })
  cpuUsage: number;

  @IsValidEpochMillis({ message: 'Uptime must be valid epoch milliseconds' })
  uptime: number;

  @RequiredNumberApiProperty({
    description: 'Hardware internal temperature in celcius degree',
    example: '78',
  })
  internalTemp: number;

  @RequiredNumberApiProperty({
    description: 'Wifi Received Signal Strength Indicator',
    example: '-52',
  })
  wifiRssi: number;
}

/**
  Example:
    {
      "userId": "user-001",
      "responseId": "fw-20251104-status",
      "responseCode": 210,
      "requestId": "req-hs-35",
      "deviceId": "sensor-67890",
      "memoryUsage": 232500,
      "cpuUsage": 32,
      "uptime": 1762379000000,
      "timestamp": 1762379573804,
      "internalTemp": 78,
      "wifiRssi": -52
    }
 */
