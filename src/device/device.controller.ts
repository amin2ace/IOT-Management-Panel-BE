import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { DeviceService } from './device.service';
import { QueryDeviceDto } from './dto/query-device.dto';
import { ControlDeviceDto } from './dto/control-device.dto';
import { Sensor } from './repository/sensor.entity';
import {
  DiscoveryBroadcastRequestDto,
  DiscoveryUnicastRequestDto,
  SensorConfigRequestDto,
  SensorFunctionalityRequestDto,
} from './messages';
import { TelemetryRequestDto } from './messages/publish/telemetry.request.dto';
import { HardwareStatusRequestDto } from './messages/publish/hardware-status.request';
import { SessionAuthGuard } from '@/common/guard/session-auth.guard';
import { RolesGuard } from '@/common/guard/roles.guard';
import { Roles } from '@/config/decorator/roles.decorator';
import { Role } from '@/config/types/roles.types';
import { GetAllDevicesResponseDto } from './dto/get-all-devices.response.dto';
import { SensorResponseDto } from './dto/sensor-response.dto';

@ApiTags('Devices')
@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get('all')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all devices' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'List of devices' })
  async getSensors(
    @Query() query: QueryDeviceDto,
  ): Promise<GetAllDevicesResponseDto> {
    return await this.deviceService.getSensors(query);
  }

  @Get(':id')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get single device' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: "List device's information" })
  async getSingleSensor(
    @Param('id') sensorId: string,
  ): Promise<SensorResponseDto> {
    return await this.deviceService.getSensor(sensorId);
  }

  @Post('discover-broadcast')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Discover devices via broadcast' })
  @ApiCookieAuth()
  async discoverDevicesBroadcast(
    @Body() discoverRequest: DiscoveryBroadcastRequestDto,
  ) {
    return await this.deviceService.discoverDevicesBroadcast(discoverRequest);
  }

  @Post('discover-unicast')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Discover devices via unicast' })
  @ApiCookieAuth()
  async discoverDeviceUnicast(
    @Body() discoverRequest: DiscoveryUnicastRequestDto,
  ) {
    return await this.deviceService.discoverDeviceUnicast(discoverRequest);
  }

  @Get('unassigned')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get unassigned devices' })
  @ApiCookieAuth()
  async getUnassignedSensor(): Promise<Sensor[]> {
    return await this.deviceService.getUnassignedSensor();
  }

  @Post('hardware-status')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get device hardware status' })
  @ApiCookieAuth()
  async getHardwareStatus(@Body() statusRequest: HardwareStatusRequestDto) {
    return await this.deviceService.getHardwareStatus(statusRequest);
  }

  @Put('provision')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Provision device' })
  @ApiCookieAuth()
  async provisionDevice(
    @Body() body: SensorFunctionalityRequestDto,
  ): Promise<string> {
    return await this.deviceService.AssignDeviceFunction(body);
  }

  @Delete(':id')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete device' })
  @ApiCookieAuth()
  async deleteSensor(@Param('id') id: string) {
    return this.deviceService.deleteSensor(id);
  }

  @Post('config')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Reconfigure device' })
  @ApiCookieAuth()
  async reconfigureDevice(@Body() configData: SensorConfigRequestDto) {
    return await this.deviceService.reconfigureDevice(configData);
  }

  @Get(':id/history')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.VIEWER, Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get device history' })
  @ApiCookieAuth()
  async getHistory(@Param('id') id: string) {
    return this.deviceService.getDeviceHistory(id);
  }

  @Post(':id/control')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Control device' })
  @ApiCookieAuth()
  async controlDevice(@Param('id') id: string, @Body() body: ControlDeviceDto) {
    return this.deviceService.controlDevice(id, body);
  }

  @Get(':id/status')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.VIEWER, Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get device status' })
  @ApiCookieAuth()
  async getDeviceStatus(@Param('id') id: string) {
    return this.deviceService.getDeviceStatus(id);
  }

  @Get('telemetry')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.VIEWER, Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get device telemetry' })
  @ApiCookieAuth()
  async getDeviceTelemetry(@Body() telemetry: TelemetryRequestDto) {
    return await this.deviceService.getDeviceTelemetry(telemetry);
  }
}
