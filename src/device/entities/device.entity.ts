import {
  Entity,
  ObjectIdColumn,
  ObjectId,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum DeviceState {
  DISCOVERED = 'discovered', // received capabilities but not assigned
  ASSIGNED = 'assigned', // assigned a type, config sent
  ACTIVE = 'active', // sending valid data
  ERROR = 'error', // data invalid / offline
}

@Entity('devices')
export class DeviceEntity {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  @Index({ unique: true })
  deviceId: string; // ESP unique ID (MAC or custom ID)

  @Column()
  name?: string;

  @Column({ type: 'array', default: [] })
  capabilities: string[]; // e.g. ["temperature", "humidity"]

  @Column({ nullable: true })
  assignedType?: string; // selected from capabilities

  @Column({ nullable: true })
  publishTopic?: string; // like "sensors/<client>/temperature/<device>"

  @Column({
    type: 'enum',
    enum: DeviceState,
    default: DeviceState.DISCOVERED,
  })
  state: DeviceState;

  @Column({ nullable: true })
  clientId?: string; // multi-tenant support

  @Column()
  lastValue?: number; // useful for HMI snapshot

  @Column({ nullable: true })
  lastValueAt?: number; // timestamp of latest MQTT update

  @Column({ nullable: true })
  status?: string; // ONLINE / OFFLINE / ERROR msg

  @Column({ default: false })
  isActuator: boolean; // distinguish sensor vs controller

  @Column({ default: false })
  hasError: boolean;

  @Column({ nullable: true })
  firmware?: string;

  @Column({ nullable: true })
  mac?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
