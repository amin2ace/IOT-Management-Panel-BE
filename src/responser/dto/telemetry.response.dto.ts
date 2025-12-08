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
import { IsValidTimestampMillis } from 'src/config/decorator/timestamp-validation.decorator';
import { ResponseMessageCode } from '../../common/enum/response-message-code.enum';

export class TelemetryResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user who initiated the request',
    example: 'user-001',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Unique identifier for the response',
    example: 'fw-20251104-status',
  })
  @IsNotEmpty()
  @IsString()
  responseId: string;

  @ApiProperty({
    description: 'Response code from the device or system',
    example: ResponseMessageCode.RESPONSE_TELEMETRY_DATA,
  })
  @IsNotEmpty()
  @IsNumber()
  responseCode: number;

  @ApiProperty({
    description: 'Unique identifier for the request',
    example: 'fw-t-43',
  })
  @IsNotEmpty()
  @IsString()
  requestId: string;

  @ApiProperty({
    description: 'Device ID that performed the diagnostic',
    example: 'sensor-67890',
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;

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
    description: 'Time of the response in epoch milli second',
    example: '1762379573804',
  })
  @IsValidTimestampMillis() // 5min behind, 30sec ahead
  timestamp: number;

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
      "userId": "user-001",
      "responseId": "fw-20251104-status",
      "responseCode": 211,
      "requestId": "fw-t-43",
      "deviceId": "sensor-67890",
      "metric": "Temperature",
      "value": 24.5,
      "status": "OK",
      "createdAt": 1762379573804,
      "meta": {
        "firmwareVersion": "1.0.3",
        "location": {
          "latitude": 37.7749,
          "longitude": -122.4194,
          "altitude": 15
        },
        "comment": "Initial reading from device"
      }
    }
      
 */
