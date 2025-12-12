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
import { PublishSensorFunctionalityDto } from './dto/messages';
import { PublishTelemetryDto } from './dto/messages/Publish-telemetry.dto';
import { SessionAuthGuard } from '@/common/guard/session-auth.guard';
import { RolesGuard } from '@/common/guard/roles.guard';
import { Roles } from '@/config/decorator/roles.decorator';
import { Role } from '@/config/types/roles.types';
import { SensorDto } from './dto/sensor.dto';
import { Serialize } from '@/common';
import { PublishSetDeviceConfigDto } from './dto/messages/publish-set-device-config.dto';
import { GetAllDevicesDto } from '@/device/dto/get-all-devices.dto';
import { SensorConfigDto } from './dto/sensor-config.dto';
import { SensorConfig } from './repository/sensor-config.entity';
import { Sensor } from './repository/sensor.entity';
import { CurrentUser } from '@/config/decorator/current-user.decorator';
import { User } from '@/users/entities/user.entity';

@ApiTags('Devices')
@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get('all')
  @Serialize(GetAllDevicesDto)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all devices' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'List of devices' })
  async getAllSensors(
    @CurrentUser('userId') userId: string,
  ): Promise<GetAllDevicesDto> {
    return await this.deviceService.getAllSensors();
  }

  @Get(':id')
  @Serialize(SensorDto)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get single device' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: "List device's information" })
  async getSingleSensor(@Param('id') deviceId: string): Promise<SensorDto> {
    return await this.deviceService.getSingleSensor(deviceId);
  }

  @Get('query')
  @Serialize(GetAllDevicesDto)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Query devices' })
  @ApiCookieAuth()
  @ApiResponse({ status: 200, description: 'Query the list of devices' })
  async querySensors(
    @Query() query: QueryDeviceDto,
  ): Promise<GetAllDevicesDto> {
    return await this.deviceService.querySensors(query);
  }

  @Post('discover-broadcast')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Discover devices via broadcast' })
  @ApiResponse({
    status: 201,
    description: 'Discovery broadcast sent successfully',
  })
  @ApiCookieAuth()
  async discoverDevicesBroadcast(
    @CurrentUser('userId') userId: string,
  ): Promise<void> {
    return await this.deviceService.discoverDevicesBroadcast(userId);
  }

  @Post('discover-unicast/:id')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Discover devices via unicast' })
  @ApiResponse({
    status: 201,
    description: 'Discovery unicast sent successfully',
  })
  @ApiCookieAuth()
  async discoverDeviceUnicast(
    @CurrentUser('userId') userId: string,
    @Param('id') deviceId: string,
  ): Promise<void> {
    return await this.deviceService.discoverDeviceUnicast(userId, deviceId);
  }

  @Get('unassigned')
  @Serialize(SensorDto)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get unassigned devices' })
  @ApiCookieAuth()
  async getUnassignedSensor(): Promise<Sensor[]> {
    return await this.deviceService.getUnassignedSensor();
  }

  @Post('hardware-status/:id')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get device hardware status' })
  @ApiCookieAuth()
  async getHardwareStatus(
    @CurrentUser() currentUser: User,
    @Param('id') deviceId: string,
  ) {
    return await this.deviceService.getHardwareStatus(currentUser, deviceId);
  }

  @Put('provision')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Provision device' })
  @ApiCookieAuth()
  async provisionDevice(
    @CurrentUser() currentUser: User,
    @Body() body: PublishSensorFunctionalityDto,
  ): Promise<string> {
    return await this.deviceService.AssignDeviceFunction(currentUser, body);
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
  @Serialize(SensorConfigDto)
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get device configuration' })
  @ApiCookieAuth()
  async getDeviceConfiguration(
    @Param('id') deviceId: string,
  ): Promise<SensorConfig> {
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
