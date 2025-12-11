import { LogLevel } from '@/config/enum/log-level.enum';
import { Protocol } from '@/config/enum/protocol.enum';
import {
  Entity,
  ObjectIdColumn,
  ObjectId,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
} from 'typeorm';
import { MeasurementUnit } from '@/config/enum/measurement-unit.enum';
import { Sensor } from './sensor.entity';

// Embedded classes
class NetworkConfigEntity {
  @Column({ nullable: true })
  wifiSsid?: string;

  @Column({ nullable: true })
  wifiPassword?: string;

  @Column({ default: true })
  dhcp: boolean = true;

  @Column({ nullable: true })
  ip?: string;

  @Column({ nullable: true })
  subnetMask?: string;

  @Column({ nullable: true })
  gateway?: string;

  @Column({ nullable: true })
  dnsServer1?: string;

  @Column({ nullable: true })
  dnsServer2?: string;

  @Column({ nullable: true })
  accessPointSsid?: string;

  @Column({ nullable: true })
  accessPointPassword?: string;
}

class LoggingConfigEntity {
  @Column({
    type: 'enum',
    enum: LogLevel,
    default: LogLevel.INFO,
  })
  level: LogLevel = LogLevel.INFO;

  @Column({ default: false })
  enableSerial: boolean = false;

  @Column({ type: 'int', nullable: true })
  baudrate?: number;

  @Column({ nullable: true })
  externalServer?: string;
}

class OtaConfigEntity {
  @Column({ default: false })
  enabled: boolean = false;

  @Column({ nullable: true })
  url?: string;

  @Column({ type: 'int', nullable: true })
  checkInterval?: number;
}

class DeviceLocationEntity {
  @Column({ nullable: true })
  site?: string;

  @Column({ type: 'int', nullable: true })
  floor?: number;

  @Column({ nullable: true })
  unit?: string;
}

class ThresholdEntity {
  @Column({ type: 'float' })
  high: number;

  @Column({ type: 'float' })
  low: number;

  @Column({
    nullable: true,
    type: 'enum',
    enum: MeasurementUnit,
    default: MeasurementUnit.CELSIUS,
  })
  unit?: MeasurementUnit;
}

@Entity('config')
export class SensorConfig {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  @Index()
  deviceId: string;

  @Column({ nullable: true })
  @Index()
  controllerId?: string;

  @Column({ type: 'bigint' })
  @Index()
  timestamp: number;

  @Column({ nullable: true })
  baseTopic?: string;

  @Column(() => NetworkConfigEntity)
  network?: NetworkConfigEntity;

  @Column({ nullable: true })
  timezone?: string;

  @Column(() => LoggingConfigEntity)
  logging?: LoggingConfigEntity;

  @Column(() => OtaConfigEntity)
  ota?: OtaConfigEntity;

  @Column({ type: 'int', nullable: true })
  interval?: number;

  @Column(() => DeviceLocationEntity)
  location?: DeviceLocationEntity;

  @Column(() => ThresholdEntity)
  threshold?: ThresholdEntity;

  @Column({
    type: 'enum',
    enum: Protocol,
    default: Protocol.MQTT,
  })
  protocol: Protocol = Protocol.MQTT;

  @Column({ type: 'int', default: 1 })
  configVersion: number = 1;

  @Column({ type: 'json', nullable: true })
  customSettings?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean = true;

  @OneToOne(() => Sensor, (sensor) => sensor.deviceId)
  sensor: Sensor;
}
