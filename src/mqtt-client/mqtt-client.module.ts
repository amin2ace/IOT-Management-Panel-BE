import { Module } from '@nestjs/common';
import { MqttClientService } from './mqtt-client.service';
import { MqttManagementController } from './mqtt-client.controller';
import { TopicModule } from 'src/topic/topic.module';

@Module({
  imports: [TopicModule],
  controllers: [MqttManagementController],
  providers: [MqttClientService],
  exports: [MqttClientService],
})
export class MqttClientModule {}
