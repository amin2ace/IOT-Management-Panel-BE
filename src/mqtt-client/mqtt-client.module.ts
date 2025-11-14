import { Module } from '@nestjs/common';
import { MqttClientService } from './mqtt-client.service';
import { MqttManagementController } from './mqtt-client.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TopicService } from 'src/topic/topic.service';

@Module({
  imports: [TopicService],
  controllers: [MqttManagementController],
  providers: [MqttClientService],
  exports: [MqttClientService],
})
export class MqttClientModule {}
