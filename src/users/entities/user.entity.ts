import { ObjectId } from 'mongodb';
import { Role } from 'src/config/types/roles.types';
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
  username: string;

  @Column()
  password: string;

  @Column({ default: true, type: 'boolean' })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: Role,
    array: true,
    default: [Role.VIEWER],
  })
  roles: Role[];

  @BeforeInsert()
  generateId() {
    this.userId = uuidv4();
  }
}
