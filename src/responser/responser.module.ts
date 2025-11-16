import { Module } from '@nestjs/common';
import { ResponserService } from './responser.service';
import { ResponserController } from './responser.controller';
import { ListenerService } from './listener.service';
import { RedisModule } from '@/redis/redis.module';
import { LogHandlerModule } from '@/log-handler/log-handler.module';
import { DeviceModule } from '@/device/device.module';
import { MqttClientModule } from '@/mqtt-client/mqtt-client.module';
import { TopicModule } from '@/topic/topic.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sensor } from '@/device/repository/sensor.entity';
import { Telemetry } from '@/device/repository/sensor-telemetry.entity';
import { HardwareStatus } from '@/device/repository/hardware-status.entity';
import { GatewayModule } from '@/gateway/gateway.module';
import { SessionModule } from '@/session/session.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sensor, Telemetry, HardwareStatus]),

    RedisModule,
    LogHandlerModule,
    DeviceModule,
    MqttClientModule,
    TopicModule,
    GatewayModule,
    SessionModule,
  ],
  controllers: [ResponserController],
  providers: [ResponserService, ListenerService],
  exports: [ResponserService],
})
export class ResponserModule {}
