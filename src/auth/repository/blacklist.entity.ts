import { ObjectId } from 'mongodb';
import {
  Entity,
  Column,
  BeforeInsert,
  PrimaryColumn,
  ObjectIdColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Blacklist {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  token: string;
}
