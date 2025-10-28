import { Entity, Column, BeforeInsert, PrimaryColumn } from "typeorm";
import { v4 as uuidv4 } from "uuid";

@Entity()
export class Blacklist {
  @PrimaryColumn()
  id: string;

  @Column()
  token: string;

  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }
}
