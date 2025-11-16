import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { TopicService } from './topic.service';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { SessionAuthGuard } from '@/common/guard/session-auth.guard';
import { RolesGuard } from '@/common/guard/roles.guard';
import { Roles } from '@/config/decorator/roles.decorator';
import { Role } from '@/config/types/roles.types';

@ApiTags('Topics')
@Controller('topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Get('device/:id')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all topics for device' })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: "Returns list of device's topics",
  })
  async getDeviceTopicsByDeviceId(@Param('id') deviceId: string) {
    return await this.topicService.getDeviceTopicsByDeviceId(deviceId);
  }

  @Get('subscribed')
  @UseGuards(SessionAuthGuard, RolesGuard)
  @Roles(Role.VIEWER, Role.ENGINEER, Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all subscribed topics' })
  @ApiCookieAuth()
  @ApiResponse({
    status: 200,
    description: 'Returns list of subscribed topics',
  })
  async getSubscribedTopics() {
    return await this.topicService.getAllSubscribedTopics();
  }
}
