import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { MqttClientModule } from 'src/mqtt-client/mqtt-client.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sensor } from './repository/sensor.entity';
import { Telemetry } from './repository/sensor-telemetry.entity';
import { HardwareStatus } from './repository/hardware-status.entity';
import { TopicModule } from 'src/topic/topic.module';
import { LogHandlerModule } from 'src/log-handler/log-handler.module';
import { SessionModule } from '@/session/session.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sensor, Telemetry, HardwareStatus]),
    MqttClientModule,
    TopicModule,
    LogHandlerModule,
    SessionModule,
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
  exports: [DeviceService],
})
export class DeviceModule {}
