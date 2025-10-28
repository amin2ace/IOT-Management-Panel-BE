import {
  BeforeInsert,
  Column,
  Entity,
  PrimaryColumn,
} from "typeorm";
import { v4 as uuidv4 } from "uuid";

@Entity()
export class Token {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: false })
  token: string;

  @Column()
  userId: string;

  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }
}
