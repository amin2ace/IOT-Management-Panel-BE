import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { DeviceService } from './device.service';
import { QueryDeviceDto } from './dto/query-device.dto';
import { AssignDeviceDto } from './dto/assign-device.dto';
import { ControlDeviceDto } from './dto/control-device.dto';

@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  getDevices(@Query() query: QueryDeviceDto) {
    return this.deviceService.getDevices(query);
  }

  @Get('unassigned')
  getUnassignedDevices() {
    return this.deviceService.getUnassignedDevices();
  }

  @Get(':id')
  getDeviceDetails(@Param('id') id: string) {
    return this.deviceService.getDeviceById(id);
  }

  @Put(':id/assign')
  assignDevice(@Param('id') id: string, @Body() body: AssignDeviceDto) {
    return this.deviceService.assignDevice(id, body);
  }

  @Delete(':id')
  deleteDevice(@Param('id') id: string) {
    return this.deviceService.deleteDevice(id);
  }

  @Post(':id/reconfigure')
  reconfigureDevice(@Param('id') id: string) {
    return this.deviceService.reconfigureDevice(id);
  }

  @Get(':id/live')
  getLiveStatus(@Param('id') id: string) {
    return this.deviceService.getLiveStatus(id);
  }

  @Get(':id/history')
  getHistory(@Param('id') id: string) {
    return this.deviceService.getDeviceHistory(id);
  }

  @Post(':id/control')
  controlDevice(@Param('id') id: string, @Body() body: ControlDeviceDto) {
    return this.deviceService.controlDevice(id, body);
  }

  @Get(':id/status')
  getDeviceStatus(@Param('id') id: string) {
    return this.deviceService.getDeviceStatus(id);
  }
}
