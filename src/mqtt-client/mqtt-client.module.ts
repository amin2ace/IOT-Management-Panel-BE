import { TopicModule } from '@/topic/topic.module';
import { Module } from '@nestjs/common';
import { MqttManagementController } from './mqtt-client.controller';
import { MqttClientService } from './mqtt-client.service';

@Module({
  imports: [TopicModule],
  controllers: [MqttManagementController],
  providers: [MqttClientService],
  exports: [MqttClientService],
})
export class MqttClientModule {}
