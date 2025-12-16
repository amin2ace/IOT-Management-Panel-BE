import { DeviceCapabilities } from '@/config/enum/sensor-type.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ObjectIdColumn,
  OneToOne,
  PrimaryGeneratedColumn,
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
  deviceId: string;

  @Column()
  deviceHardware: string;

  // ============ Capabilities & Functionality ============
  @Column()
  capabilities: DeviceCapabilities[];

  @Column({ nullable: true })
  controllers?: string[];

  @Column({ nullable: true })
  assignedFunctionality?: DeviceCapabilities[];

  @Column()
  provisionState: ProvisionState;

  @Column()
  connectionState: ConnectionState;

  @Column({ default: false })
  isActuator: boolean;

  @Column({ default: false })
  hasError: boolean;

  @Column({ nullable: true })
  errorMessage?: string;

  // ============ Measurements ============
  @Column({ nullable: true })
  lastValue?: number;

  @Column({ nullable: true })
  lastValueAt?: number;

  // ============ Device Information ============
  @Column({ nullable: true })
  firmware?: string;

  @Column()
  broker: string;

  // ============ System Fields ============
  @Column({ default: false })
  isDeleted: boolean;

  @Column({ default: true })
  isActive: boolean = true;

  // ============ Maintenance & Updates ============
  @Column({ nullable: true })
  lastReboot?: Date;

  @Column({ nullable: true })
  lastUpgrade?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Sensor entity
  @OneToOne((type) => SensorConfig, {
    cascade: true,
    eager: true,
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  configuration: SensorConfig;
}
