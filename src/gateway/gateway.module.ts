import { Module } from '@nestjs/common';
import { MqttGateway } from './ws.gateway';
import { MqttGatewayService } from './gateway.service';
import { MqttClientModule } from '../mqtt-client/mqtt-client.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import MessageIncoming from './repository/message-incoming.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MessageIncoming]), MqttClientModule],
  providers: [MqttGateway, MqttGatewayService],
  exports: [MqttGatewayService],
})
export class MqttGatewayModule {}
