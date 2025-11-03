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
import { SensorAssignTypeDto } from './dto/sensor-assign-type.dto';
import { ControlDeviceDto } from './dto/control-device.dto';
import { Device } from './repository/device.entity';
import { DeviceDiscoveryDto } from './dto/discovery-params.dto';

@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get('all')
  async getDevices(@Query() query: QueryDeviceDto): Promise<Device[]> {
    return await this.deviceService.getDevices(query);
  }

  @Get('discover')
  async discoverDevices(@Body() discoverParams: DeviceDiscoveryDto) {
    return await this.deviceService.discoverDevices(discoverParams);
  }

  @Get('unassigned')
  async getUnassignedDevices(): Promise<Device[]> {
    return await this.deviceService.getUnassignedDevices();
  }

  @Get(':id')
  async getDeviceDetails(@Param('id') id: string): Promise<Device> {
    return await this.deviceService.getDeviceById(id);
  }

  @Put(':id/provision')
  async provisionDevice(
    @Param('id') id: string,
    @Body() body: SensorAssignTypeDto,
  ): Promise<string> {
    return await this.deviceService.provisionDevice(id, body);
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
