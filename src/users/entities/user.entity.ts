import { ObjectId } from 'mongodb';
import { Column, Entity, ObjectIdColumn, BeforeInsert } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ unique: true })
  userId: string;

  @Column({ unique: true })
  email: string;

  @Column()
  userName: string;

  @Column()
  password: string;

  @Column({ default: true, type: 'boolean' })
  isActive: boolean;

  @BeforeInsert()
  generateId() {
    this.userId = uuidv4();
  }
}
