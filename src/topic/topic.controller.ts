import { Controller, Get, Param } from '@nestjs/common';
import { TopicService } from './topic.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Get('subscribed/:id')
  @ApiOperation({ summary: 'Get all subscribed topics' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of subscribed topics',
  })
  async getSubscribedTopics(@Param('id') deviceId: string) {
    return await this.topicService.getDeviceTopics(deviceId);
  }
}
