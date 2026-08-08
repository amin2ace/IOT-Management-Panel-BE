import { RequiredStringApiProperty } from '@/common/decorator/api-properties';
import { OptionalNumberApiProperty } from '@/common/decorator/api-properties/optional-number-property.decorator';
import { OptionalStringApiProperty } from '@/common/decorator/api-properties/optional-string-property.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
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
  @RequiredStringApiProperty({
    description: 'Unique identifier for the sensor',
    example: 'sensor-temperature-room1',
  })
  deviceId!: string;

  @RequiredStringApiProperty({
    description: 'Type of sensor measurement',
    example: 'temperature',
  })
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

  @RequiredStringApiProperty({
    description: 'Unit of measurement',
    example: '°C',
  })
  unit!: string;

  @ApiProperty({
    description: 'Data quality indicator',
    enum: DataQuality,
    example: DataQuality.GOOD,
  })
  @IsEnum(DataQuality)
  quality!: DataQuality;

  @OptionalStringApiProperty({
    description: 'Sensor location if available',
    example: 'Room 1',
  })
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

  @OptionalNumberApiProperty({
    description: 'Signal strength in dBm',
    example: -65,
  })
  signalStrength?: number;

  @ApiPropertyOptional({
    description: 'Additional sensor-specific data',
    example: { calibration: 1.02, firmware: 'v2.1.0' },
  })
  @IsObject()
  @IsOptional()
  additionalData?: Record<string, any>;

  @RequiredStringApiProperty({
    description: 'Original timestamp from sensor if available',
    example: '2023-12-07T10:30:00.000Z',
  })
  timestamp!: string;
}
