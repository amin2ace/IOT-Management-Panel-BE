import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { MqttManagementModule } from 'src/mqtt-management/mqtt-management.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './repository/device.entity';
import { Measurement } from './repository/measurement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Device, Measurement]),
    MqttManagementModule,
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class DeviceModule {}
