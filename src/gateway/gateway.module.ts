import { Module } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { MqttClientModule } from '../mqtt-client/mqtt-client.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import MessageIncoming from './repository/message-incoming.entity';
import { DeviceModule } from '@/device/device.module';
import { ResponserService } from '@/responser/responser.service';
import { SessionModule } from '@/session/session.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageIncoming]),
    MqttClientModule,
    DeviceModule,
    SessionModule,
  ],
  providers: [GatewayService],
  exports: [GatewayService],
})
export class GatewayModule {}
