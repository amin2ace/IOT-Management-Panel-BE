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
  PublishDiscoveryBroadcastDto,
  PublishDiscoveryUnicastDto,
  PublishSensorFunctionalityDto,
} from './dto/messages';
import { PublishTelemetryDto } from './dto/messages/Publish-telemetry.dto';
import { publishHardwareStatusDto } from './dto/messages/publish-hardware-status';
import { SessionAuthGuard } from '@/common/guard/session-auth.guard';
import { RolesGuard } from '@/common/guard/roles.guard';
import { Roles } from '@/config/decorator/roles.decorator';
import { Role } from '@/config/types/roles.types';
import { GetAllDevicesResponseDto } from './dto/get-all-devices.response.dto';
import { SensorResponseDto } from './dto/sensor-response.dto';
import { Serialize } from '@/common';
import { QuerySensorDto } from './dto/query-sensor.dto';
import PublishGetDeviceConfigDto from './dto/messages/publish-get-device-config.dto';
import { PublishSetDeviceConfigDto } from './dto/messages/publish-set-device-config.dto';
import { GetDeviceConfigDto } from '@/responser/dto';

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
  async getAllSensors(
    @Query() query: QueryDeviceDto,
  ): Promise<GetAllDevicesResponseDto> {
    return await this.deviceService.getAllSensors(query);
  }

  @Get(':id')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get single device' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: "List device's information" })
  async getSingleSensor(
    @Param('id') deviceId: string,
  ): Promise<SensorResponseDto> {
    return await this.deviceService.getSensor(deviceId);
  }

  @Post('discover-broadcast')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Discover devices via broadcast' })
  @ApiCookieAuth()
  async discoverDevicesBroadcast(
    @Body() discoverRequest: PublishDiscoveryBroadcastDto,
  ) {
    return await this.deviceService.discoverDevicesBroadcast(discoverRequest);
  }

  @Post('discover-unicast')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Discover devices via unicast' })
  @ApiCookieAuth()
  async discoverDeviceUnicast(
    @Body() discoverRequest: PublishDiscoveryUnicastDto,
  ) {
    return await this.deviceService.discoverDeviceUnicast(discoverRequest);
  }

  @Get('unassigned')
  @Serialize(QuerySensorDto)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get unassigned devices' })
  @ApiCookieAuth()
  async getUnassignedSensor(): Promise<QuerySensorDto[]> {
    return await this.deviceService.getUnassignedSensor();
  }

  @Post('hardware-status')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get device hardware status' })
  @ApiCookieAuth()
  async getHardwareStatus(@Body() statusRequest: publishHardwareStatusDto) {
    return await this.deviceService.getHardwareStatus(statusRequest);
  }

  @Put('provision')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Provision device' })
  @ApiCookieAuth()
  async provisionDevice(
    @Body() body: PublishSensorFunctionalityDto,
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

  @Get('config/:id')
  @Serialize(GetDeviceConfigDto)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get device configuration' })
  @ApiCookieAuth()
  async getDeviceConfiguration(@Param('id') deviceId: string) {
    return await this.deviceService.getDeviceConfiguration(deviceId);
  }

  @Post('config')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Reconfigure device' })
  @ApiCookieAuth()
  async reconfigureDevice(@Body() configData: PublishSetDeviceConfigDto) {
    return await this.deviceService.setDeviceConfiguration(configData);
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
  async getDeviceTelemetry(@Body() telemetry: PublishTelemetryDto) {
    return await this.deviceService.getDeviceTelemetry(telemetry);
  }
}
