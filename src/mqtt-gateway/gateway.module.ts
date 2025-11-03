import { Module } from '@nestjs/common';
import { MqttGateway } from './mqtt.gateway';
import { MqttGatewayService } from './gateway.service';
import { MqttManagementModule } from '../mqtt-management/mqtt-management.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import MessageIncoming from './repository/message-incoming.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MessageIncoming]), MqttManagementModule],
  providers: [MqttGateway, MqttGatewayService],
  exports: [MqttGatewayService],
})
export class MqttGatewayModule {}
