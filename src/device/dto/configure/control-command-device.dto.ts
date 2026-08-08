import { RequiredStringApiProperty } from '@/common/decorator/api-properties';

export class ControlDeviceDto {
  @RequiredStringApiProperty()
  command: string;
}
