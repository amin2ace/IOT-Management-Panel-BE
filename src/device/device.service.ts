import { Injectable } from '@nestjs/common';
import { QueryDeviceDto } from './dto/query-device.dto';
import { AssignDeviceDto } from './dto/assign-device.dto';
import { ControlDeviceDto } from './dto/control-device.dto';

@Injectable()
export class DeviceService {
  getDevices(query: QueryDeviceDto) {
    return { message: 'List devices', query };
  }

  getUnassignedDevices() {
    return { message: 'Unassigned devices list' };
  }

  getDeviceById(id: string) {
    return { message: 'Device details', id };
  }

  assignDevice(id: string, data: AssignDeviceDto) {
    return { message: 'Device assigned', id, data };
  }

  deleteDevice(id: string) {
    return { message: 'Device deleted', id };
  }

  reconfigureDevice(id: string) {
    return { message: 'Reconfigure sent', id };
  }

  getLiveStatus(id: string) {
    return { message: 'Live status', id };
  }

  getDeviceHistory(id: string) {
    return { message: 'History data', id };
  }

  controlDevice(id: string, data: ControlDeviceDto) {
    return { message: 'Control command', id, data };
  }

  getDeviceStatus(id: string) {
    return { message: 'Status for device', id };
  }
}
