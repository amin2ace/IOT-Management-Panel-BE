import { Module } from '@nestjs/common';
import { MqttManagementService } from './mqtt-management.service';
import { MqttManagerController } from './mqtt-management.controller';
import { MqttClientService } from './mqtt-client.service';

@Module({
  controllers: [MqttManagerController],
  providers: [MqttManagementService, MqttClientService],
})
export class MqttManagementModule {}
