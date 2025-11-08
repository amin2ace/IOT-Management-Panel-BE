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
import { ControlDeviceDto } from './dto/control-device.dto';
import { Sensor } from './repository/sensor.entity';
import {
  DiscoveryRequestDto,
  SensorConfigRequestDto,
  SensorFunctionalityRequestDto,
} from './messages';

@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get('all')
  async getSensors(@Query() query: QueryDeviceDto): Promise<Sensor[]> {
    return await this.deviceService.getSensors(query);
  }

  @Get('discover')
  async discoverDevices(@Body() discoverRequest: DiscoveryRequestDto) {
    return await this.deviceService.discoverDevices(discoverRequest);
  }

  @Get('unassigned')
  async getUnassignedSensor(): Promise<Sensor[]> {
    return await this.deviceService.getUnassignedSensor();
  }

  @Get(':id')
  async getDeviceDetails(@Param('id') id: string): Promise<Sensor> {
    return await this.deviceService.getDeviceById(id);
  }

  @Put(':id/provision')
  async provisionDevice(
    @Param('id') id: string,
    @Body() body: SensorFunctionalityRequestDto,
  ): Promise<string> {
    return await this.deviceService.provisionDevice(id, body);
  }

  @Delete(':id')
  async deleteSensor(@Param('id') id: string) {
    return this.deviceService.deleteSensor(id);
  }

  @Post('/config')
  reconfigureDevice(@Body() configData: SensorConfigRequestDto) {
    return this.deviceService.reconfigureDevice(configData);
  }

  @Get(':id/live')
  getLiveStatus(@Param('id') id: string) {
    // return this.deviceService.getLiveStatus(id);
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
