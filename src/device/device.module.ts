import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { MqttClientModule } from 'src/mqtt-client/mqtt-client.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sensor } from './repository/sensor.entity';
import { Measurement } from './repository/measurement.entity';
import { DeviceListener } from './device.listener.service';

@Module({
  imports: [TypeOrmModule.forFeature([Sensor, Measurement]), MqttClientModule],
  controllers: [DeviceController],
  providers: [DeviceService, DeviceListener],
})
export class DeviceModule {}
