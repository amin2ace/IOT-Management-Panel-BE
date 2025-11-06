import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsObject,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TelemetryMetric } from 'src/config/enum/telemetry-metrics.enum';
import { TelemetryMetaDto } from 'src/device/dto/telemetry-meta.dto';

export class TelemetryDto {
  @ApiProperty({
    description: 'Unique identifier for the response',
    example: 'res-12346',
  })
  @IsString()
  @IsNotEmpty()
  responseId: string;

  @ApiProperty({
    description: 'Numeric code representing the response type',
    example: 201,
  })
  @IsNumber()
  @IsNotEmpty()
  responseCode: number; // Request Message Code

  @ApiProperty({
    description: 'Unique identifier of the sensor',
    example: 'sensor-67890',
  })
  @IsString()
  deviceId: string; // Request from specific device

  @ApiProperty({
    description: 'Telemetry metric type',
    enum: TelemetryMetric,
    example: TelemetryMetric.Temperature,
  })
  @IsEnum(TelemetryMetric)
  metric: TelemetryMetric;

  @ApiProperty({ description: 'Measured value', example: 24.5 })
  @IsNumber()
  value: number;

  @ApiProperty({
    description: 'Telemetry status',
    example: 'OK',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: 1762379573804,
  })
  @IsNumber()
  createdAt: number;

  @ApiProperty({
    description: 'Optional metadata',
    required: false,
    type: TelemetryMetaDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TelemetryMetaDto)
  meta?: TelemetryMetaDto;
}

/**
  Example:
    {
      "responseId": "res-12346",
      "responseCode": 201,
      "deviceId": "sensor-67890",
      "metric": "temperature",
      "value": 24.5,
      "status": "OK",
      "createdAt": 1762379573804,
      "meta": {
        "firmwareVersion": "v1.2.3",
        "location": {
          "site": "greenhouse-1",
          "floor": 1,
          "unit": "tomato-section"
        },
        "comment": "Near greenhouse sensor"
      }
    }
      
 */
