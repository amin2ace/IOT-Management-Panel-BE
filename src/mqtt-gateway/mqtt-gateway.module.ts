import { Module } from '@nestjs/common';
import { MqttGatewayService } from './mqtt-gateway.service';
import { MqttGatewayGateway } from './mqtt-gateway.gateway';

@Module({
  providers: [MqttGatewayGateway, MqttGatewayService],
})
export class MqttGatewayModule {}
