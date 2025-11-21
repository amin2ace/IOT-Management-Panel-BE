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
 * Enhanced MongoDB entity for MQTT messages with better parsing support
 */
@Entity('mqtt_messages')
export class MessageIncoming {
  @ObjectIdColumn()
  id!: ObjectId;

  // Device identification
  @Index()
  @Column()
  deviceId!: string;

  // MQTT topic with indexing for better queries
  @Index()
  @Column()
  topic!: string;

  // Raw payload as received
  @Column()
  payload!: string;

  // Enhanced parsed payload structure
  @Column('json', { nullable: true })
  parsedPayload?: ParsedMessagePayload;

  // Message metadata
  @Column()
  messageSize!: number;

  @Column()
  messageFormat!: 'json' | 'text' | 'binary';

  // MQTT protocol properties
  @Column({ default: 0 })
  qos!: 0 | 1 | 2;

  @Column({ default: false })
  retain!: boolean;

  @Column({ default: false })
  dup!: boolean;

  @Column({ type: 'enum', enum: MqttDirection })
  direction!: MqttDirection;

  // Processing status
  @Column({ default: 'received' })
  status!: 'received' | 'processed' | 'error' | 'archived';

  @Column({ nullable: true })
  error?: string;

  @Column({ nullable: true })
  processingTime?: number;

  // Timestamps
  @CreateDateColumn()
  createdAt!: Date;

  @Column({ nullable: true })
  processedAt?: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Constructor for easy creation
  constructor(partial: Partial<MessageIncoming>) {
    Object.assign(this, partial);
    this.messageSize = this.payload?.length || 0;
    this.messageFormat = this.detectMessageFormat();
  }

  private detectMessageFormat(): 'json' | 'text' | 'binary' {
    if (!this.payload) return 'text';

    try {
      JSON.parse(this.payload);
      return 'json';
    } catch {
      // Check if it's likely binary data (non-printable characters)
      return /[\x00-\x08\x0E-\x1F]/.test(this.payload) ? 'binary' : 'text';
    }
  }
}

// Interface for parsed payload structure
export interface ParsedMessagePayload {
  deviceId: string;
  sensorType: string;
  value: number | string;
  unit: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor' | 'error';
  timestamp: string;
  location?: string;
  battery?: number;
  signalStrength?: number;
  additionalData?: Record<string, any>;
}

export default MessageIncoming;
