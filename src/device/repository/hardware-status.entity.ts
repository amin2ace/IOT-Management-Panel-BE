import { ObjectId } from 'mongodb';
import { Column, CreateDateColumn, Entity, ObjectIdColumn } from 'typeorm';

@Entity('Hardware-status')
export class HardwareStatus {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  readonly userId: string;

  @Column()
  readonly responseId: string;

  @Column()
  readonly deviceId: string;

  @Column()
  readonly memoryUsage: number;

  @Column()
  readonly cpuUsage: number;

  @Column()
  readonly uptime: number;

  @Column()
  readonly timestamp: Date;

  @Column()
  readonly internalTemp: number;

  @Column()
  readonly wifiRssi: number;

  @CreateDateColumn()
  readonly createdAt: Date;
}
