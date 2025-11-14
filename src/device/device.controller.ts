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
import { TelemetryRequestDto } from './messages/publish/telemetry.request.dto';
import { HardwareStatusRequestDto } from './messages/publish/hardware-status.request';

@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get('all')
  async getSensors(@Query() query: QueryDeviceDto): Promise<Sensor[]> {
    return await this.deviceService.getSensors(query);
  }

  @Get('discover-broadcast')
  async discoverDevicesBroadcast(@Body() discoverRequest: DiscoveryRequestDto) {
    return await this.deviceService.discoverDevicesBroadcast(discoverRequest);
  }

  @Get('discover-unicast')
  async discoverDeviceUnicast(@Body() discoverRequest: DiscoveryRequestDto) {
    return await this.deviceService.discoverDeviceUnicast(discoverRequest);
  }

  @Get('unassigned')
  async getUnassignedSensor(): Promise<Sensor[]> {
    return await this.deviceService.getUnassignedSensor();
  }

  @Get('hardware-status')
  async getHardwareStatus(@Body() statusRequest: HardwareStatusRequestDto) {
    return await this.deviceService.getHardwareStatus(statusRequest);
  }

  @Put('provision')
  async provisionDevice(
    @Body() body: SensorFunctionalityRequestDto,
  ): Promise<string> {
    return await this.deviceService.provisionDevice(body);
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

  @Get('/telemetry')
  async getDeviceTelemetry(@Body() telemetry: TelemetryRequestDto) {
    return await this.deviceService.getDeviceTelemetry(telemetry);
  }
}
