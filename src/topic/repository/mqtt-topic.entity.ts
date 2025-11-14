import { ObjectId } from 'mongodb';
import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TopicUseCase } from '../enum/topic-usecase.enum';

@Entity()
export class Topic {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  brokerUrl: string;

  @Column()
  deviceId: string;

  @Column({ unique: true })
  topic: string;

  @Column({ type: 'enum', enum: TopicUseCase })
  useCase: TopicUseCase;

  @Column({ type: 'boolean', default: false })
  isSubscribed: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export default Topic;
