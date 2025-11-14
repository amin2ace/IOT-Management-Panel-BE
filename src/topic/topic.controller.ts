import { Controller, Get, Param } from '@nestjs/common';
import { TopicService } from './topic.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('topic')
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Get('device/:id')
  @ApiOperation({ summary: 'Get all topics for device' })
  @ApiResponse({
    status: 200,
    description: "Returns list of device's topics",
  })
  async getDeviceTopicsByDeviceId(@Param('id') deviceId: string) {
    return await this.topicService.getDeviceTopicsByDeviceId(deviceId);
  }

  @Get('subscribed/')
  @ApiOperation({ summary: 'Get all subscribed topics' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of subscribed topics',
  })
  async getSubscribedTopics() {
    return await this.topicService.getAllSubscribedTopics();
  }
}
