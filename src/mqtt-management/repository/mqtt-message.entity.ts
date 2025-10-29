import { ObjectId } from 'mongodb';
import { MqttDirection } from 'src/config/types/mqtt-direction.types';
import {
  Entity,
  ObjectIdColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * MongoDB-friendly MQTT message entity for TypeORM (works with the Mongo driver).
 */
@Entity('mqtt_messages')
export class MqttMessage {
  @ObjectIdColumn()
  id!: ObjectId;

  // Identifier for the ESP32 sensor (MAC, chip id or custom device id)
  @Index()
  @Column({ nullable: true })
  deviceId?: string;

  // MQTT topic
  @Index()
  @Column()
  topic!: string;

  // Raw payload as string (suitable for text/binary encoded as base64 if needed)
  @Column()
  payload!: string;

  // Parsed JSON/object payload when applicable
  @Column({ nullable: true })
  parsedPayload?: any;

  // QoS (0,1,2)
  @Column({ default: 0 })
  qos!: number;

  // Retain flag
  @Column({ default: false })
  retain!: boolean;

  // DUP flag
  @Column({ default: false })
  dup!: boolean;

  // Direction (publish/subscribe)
  @Column({ type: 'enum', enum: MqttDirection })
  direction!: MqttDirection;

  // Optional status
  @Column({ nullable: true })
  status?: string;

  // Optional error text
  @Column({ nullable: true })
  error?: string;

  // Timestamps (Mongo stores Date objects)
  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  processedAt?: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

export default MqttMessage;
