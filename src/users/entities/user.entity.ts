import { ObjectId } from 'mongodb';
import { Role } from 'src/config/types/roles.types';
import {
  Column,
  Entity,
  ObjectIdColumn,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
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
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName?: string;

  @Column({ nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  photoUrl?: string;

  @Column({ default: true, type: 'boolean' })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: Role,
    array: true,
    default: [Role.VIEWER],
  })
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    this.userId = uuidv4();
  }
}
