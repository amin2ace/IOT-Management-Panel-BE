import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { MqttClientModule } from 'src/mqtt-client/mqtt-client.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sensor } from './repository/sensor.entity';
import { Telemetry } from './repository/sensor-telemetry.entity';
import { ResponseListenerService } from './response.listener.service';
import { HardwareStatus } from './repository/hardware-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sensor, Telemetry, HardwareStatus]),
    MqttClientModule,
  ],
  controllers: [DeviceController],
  providers: [DeviceService, ResponseListenerService],
})
export class DeviceModule {}
