import { ObjectId } from 'mongodb';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class MqttTopic {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  brokerUrl: string;

  @Column()
  name: string;

  @Column({ unique: true })
  topic: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastActivity: Date;
}

export default MqttTopic;
