import { LogLevel } from '@/config/enum/log-level.enum';
import { Protocol } from '@/config/enum/protocol.enum';
import {
  Entity,
  ObjectIdColumn,
  ObjectId,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  PrimaryGeneratedColumn,
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
  @Column()
  level: LogLevel = LogLevel.INFO;

  @Column({ default: false })
  enableSerial: boolean = false;

  @Column({ nullable: true })
  baudrate?: number;

  @Column({ nullable: true })
  externalServer?: string;
}

class OtaConfigEntity {
  @Column({ default: false })
  enabled: boolean = false;

  @Column({ nullable: true })
  url?: string;

  @Column({ nullable: true })
  checkInterval?: number;
}

class DeviceLocationEntity {
  @Column({ nullable: true })
  site?: string;

  @Column({ nullable: true })
  floor?: number;

  @Column({ nullable: true })
  unit?: string;
}

class ThresholdEntity {
  @Column()
  high: number;

  @Column()
  low: number;

  @Column({ nullable: true })
  unit?: MeasurementUnit;
}

@Entity('config')
export class SensorConfig {
  // @ObjectIdColumn()
  // _id: ObjectId;

  @PrimaryGeneratedColumn()
  deviceId: string;

  @Column({ nullable: true })
  controllerId?: string;

  @Column()
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

  @Column({ nullable: true })
  interval?: number;

  @Column(() => DeviceLocationEntity)
  location?: DeviceLocationEntity;

  @Column(() => ThresholdEntity)
  threshold?: ThresholdEntity;

  @Column()
  protocol: Protocol = Protocol.MQTT;

  @Column({ default: 1 })
  configVersion: number = 1;

  @Column({ nullable: true })
  customSettings?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean = true;
}
