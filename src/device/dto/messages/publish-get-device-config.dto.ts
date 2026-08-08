import {
  DeviceIdProperty,
  RequestCodeProperty,
  RequestIdProperty,
  TimeStampProperty,
  UserIdProperty,
} from '@/common/decorator/api-properties';

export default class PublishGetDeviceConfigDto {
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
