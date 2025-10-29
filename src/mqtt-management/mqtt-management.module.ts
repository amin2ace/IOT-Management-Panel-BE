import { Module } from '@nestjs/common';
import { MqttManagementService } from './mqtt-management.service';
import { MqttClientService } from './mqtt-client.service';
import { MqttManagementController } from './mqtt-management.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import MqttTopic from './repository/mqtt-topic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MqttTopic])],
  controllers: [MqttManagementController],
  providers: [MqttManagementService, MqttClientService],
  exports: [MqttClientService],
})
export class MqttManagementModule {}
