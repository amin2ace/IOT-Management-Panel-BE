import { Module } from '@nestjs/common';
import { MqttClientService } from './mqtt-client.service';
import { MqttManagementController } from './mqtt-client.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import MqttTopic from './repository/mqtt-topic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MqttTopic])],
  controllers: [MqttManagementController],
  providers: [MqttClientService],
  exports: [MqttClientService],
})
export class MqttClientModule {}
