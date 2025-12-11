import { DeviceCapabilities } from '@/config/enum/sensor-type.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ObjectIdColumn,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import { ProvisionState } from '@/config/enum/provision-state.enum';
import { ConnectionState } from '@/config/enum/connection-state.enum';
import { ObjectId } from 'mongodb';
import { SensorConfig } from './sensor-config.entity';

// Main SensorConfig entity (embedded)
@Entity('sensors')
export class Sensor {
  @ObjectIdColumn()
  _id: ObjectId;

  // ============ Identification & Basic Info ============
  @Column()
  @Index({ unique: true })
  deviceId: string;

  @Column()
  @Index()
  deviceHardware: string;

  // ============ Capabilities & Functionality ============
  @Column({ type: 'enum', enum: DeviceCapabilities, array: true })
  capabilities: DeviceCapabilities[];

  @Column({ type: 'array', nullable: true })
  @Index()
  controllers?: string[];

  @Column({
    type: 'enum',
    enum: DeviceCapabilities,
    array: true,
    nullable: true,
  })
  assignedFunctionality?: DeviceCapabilities[];

  @Column({
    type: 'enum',
    enum: ProvisionState,
    default: ProvisionState.DISCOVERED,
  })
  @Index()
  provisionState: ProvisionState;

  @Column({
    type: 'enum',
    enum: ConnectionState,
    default: ConnectionState.OFFLINE,
  })
  @Index()
  connectionState: ConnectionState;

  @Column({ default: false })
  isActuator: boolean;

  @Column({ default: false })
  @Index()
  hasError: boolean;

  @Column({ nullable: true })
  errorMessage?: string;

  // ============ Measurements ============
  @Column({ type: 'float', nullable: true })
  lastValue?: number;

  @Column({ type: 'bigint', nullable: true })
  @Index()
  lastValueAt?: number;

  // ============ Device Information ============
  @Column({ nullable: true })
  firmware?: string;

  @Column()
  broker: string;

  // ============ System Fields ============
  @Column({ default: false })
  @Index()
  isDeleted: boolean;

  @Column({ default: true })
  @Index()
  isActive: boolean = true;

  // ============ Maintenance & Updates ============
  @Column({ type: 'timestamp', nullable: true })
  lastReboot?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUpgrade?: Date;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => SensorConfig, (config) => config.deviceId)
  configuration: SensorConfig;
}
