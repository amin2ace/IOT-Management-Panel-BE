import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsObject,
} from 'class-validator';

export enum DataQuality {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  ERROR = 'error',
}

export class SensorDataDto {
  @ApiProperty({
    description: 'Unique identifier for the sensor',
    example: 'sensor-temperature-room1',
  })
  @IsString()
  @IsNotEmpty()
  sensorId!: string;

  @ApiProperty({
    description: 'Type of sensor measurement',
    example: 'temperature',
  })
  @IsString()
  @IsNotEmpty()
  sensorType!: string;

  @ApiProperty({
    description: 'Measurement value (numeric or string)',
    oneOf: [
      { type: 'number', example: 25.5 },
      { type: 'string', example: 'ON' },
    ],
  })
  @IsNotEmpty()
  value!: number | string;

  @ApiProperty({
    description: 'Unit of measurement',
    example: '°C',
  })
  @IsString()
  @IsNotEmpty()
  unit!: string;

  @ApiProperty({
    description: 'Data quality indicator',
    enum: DataQuality,
    example: DataQuality.GOOD,
  })
  @IsEnum(DataQuality)
  quality!: DataQuality;

  @ApiPropertyOptional({
    description: 'Sensor location if available',
    example: 'Room 1',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    description: 'Battery level percentage',
    minimum: 0,
    maximum: 100,
    example: 85,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  battery?: number;

  @ApiPropertyOptional({
    description: 'Signal strength in dBm',
    example: -65,
  })
  @IsNumber()
  @IsOptional()
  signalStrength?: number;

  @ApiPropertyOptional({
    description: 'Additional sensor-specific data',
    example: { calibration: 1.02, firmware: 'v2.1.0' },
  })
  @IsObject()
  @IsOptional()
  additionalData?: Record<string, any>;

  @ApiProperty({
    description: 'Original timestamp from sensor if available',
    example: '2023-12-07T10:30:00.000Z',
  })
  @IsString()
  @IsNotEmpty()
  timestamp!: string;
}
