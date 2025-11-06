import { ConnectionState } from 'src/config/enum/connection-state.enum';
import { ProvisionState } from 'src/config/enum/provision-state.enum';
import { Protocol } from 'src/config/enum/protocol.enum';
import {
  Entity,
  ObjectIdColumn,
  ObjectId,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { SensorType } from 'src/config/enum/sensor-type.enum';

@Entity('devices')
export class Sensor {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  @Index({ unique: true })
  sensorId: string; // ESP unique ID (MAC or custom ID)

  @Column({ type: 'array', default: [] })
  capabilities: string[]; // e.g. ["temperature", "humidity"]

  @Column()
  deviceHardware: string; // device model or hardware ID

  @Column({
    type: 'enum',
    enum: SensorType,
    array: true,
    nullable: true,
  })
  assignedFunctionality: SensorType[]; // selected from capabilities

  @Column({ nullable: true })
  deviceBaseTopic: string; // like "<mqttPrefix>/<sensorId>/temperature"

  @Column()
  location: object; // like { room: 'Greenhouse', floor: 1, unit: 'tomato-section' }

  @Column({
    type: 'enum',
    enum: ProvisionState,
    default: ProvisionState.DISCOVERED,
  })
  provisionState: ProvisionState;

  @Column({ nullable: true })
  clientId: string; // multi-tenant support

  @Column()
  lastValue: number; // useful for HMI snapshot

  @Column({ nullable: true })
  lastValueAt: number; // timestamp of latest MQTT update

  @Column({ type: 'enum', enum: ConnectionState, nullable: true })
  connectionState: ConnectionState; // ONLINE / OFFLINE / ERROR msg

  @Column({ default: false })
  isActuator: boolean; // distinguish sensor vs controller

  @Column({ default: false })
  hasError: boolean;

  @Column({ nullable: true })
  firmware: string;

  @Column({ nullable: true })
  mac: string;

  @Column({ nullable: true })
  ip: string;

  @Column({ type: 'enum', enum: Protocol })
  protocol: Protocol;

  @Column()
  broker: string;

  @Column({ default: false })
  isDeleted: boolean;

  @Column({ nullable: true, default: null })
  lastReboot: Date;

  @Column({ nullable: true, default: null })
  lastUpgrade: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
