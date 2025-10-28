import { Module } from '@nestjs/common';
import { MqttManagementService } from './mqtt-management.service';
import { MqttManagementController } from './mqtt-management.controller';

@Module({
  controllers: [MqttManagementController],
  providers: [MqttManagementService],
})
export class MqttManagementModule {}
