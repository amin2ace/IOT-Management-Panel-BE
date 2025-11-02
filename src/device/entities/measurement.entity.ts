import {
  Entity,
  ObjectIdColumn,
  ObjectId,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('measurements')
export class MeasurementEntity {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  @Index()
  deviceId: string;

  @Column('float')
  value: number;

  @Column()
  type: string; // "temperature", "humidity", etc.

  @Column()
  clientId: string;

  @CreateDateColumn()
  timestamp: Date;
}
