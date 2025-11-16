import { Module } from '@nestjs/common';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import Topic from './repository/mqtt-topic.entity';
import { SessionModule } from '@/session/session.module';

@Module({
  imports: [TypeOrmModule.forFeature([Topic]), SessionModule],
  controllers: [TopicController],
  providers: [TopicService],
  exports: [TopicService],
})
export class TopicModule {}
