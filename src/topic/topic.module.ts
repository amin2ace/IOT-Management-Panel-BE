import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import MqttTopic from './repository/mqtt-topic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MqttTopic])],
  controllers: [TopicController],
  providers: [TopicService],
  exports: [TopicService],
})
export class TopicModule {}
