import { TelemetryMetric } from 'src/config/enum/telemetry-metrics.enum';
import {
  Entity,
  ObjectIdColumn,
  ObjectId,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { DeviceLocationDto } from '../dto/device-location.dto';

@Entity('Telemetry')
export class Telemetry {
  @ObjectIdColumn()
  _id: ObjectId;

  // Identify the device
  @Column()
  readonly deviceId: string;

  // Store the name or type of the measured signal
  @Column({ type: 'enum', enum: TelemetryMetric })
  readonly metric: TelemetryMetric;

  // Actual telemetry data
  @Column()
  readonly value: number;

  // The time of creating record
  @CreateDateColumn()
  readonly createdAt: Date;

  // Optional extra metadata fields
  @Column({ type: 'simple-json', nullable: true })
  readonly meta?: {
    readonly firmwareVersion?: string;
    readonly location?: DeviceLocationDto;
    readonly comment?: string;
  };
}
