import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { TelemetryMetric } from 'src/config/enum/telemetry-metrics.enum';
import { TelemetryMetaDto } from '@/device/dto/configure/telemetry-meta.dto';
import {
  DeviceIdProperty,
  RequestIdProperty,
  RequiredNumberApiProperty,
  ResponseCodeProperty,
  ResponseIdProperty,
  TimeStampProperty,
  UserIdProperty,
} from '@/common/decorator/api-properties';

export class TelemetryResponseDto {
  @UserIdProperty()
  userId: string;

  @ResponseIdProperty()
  responseId: string;

  @ResponseCodeProperty()
  responseCode: number; // Request Message Code

  @RequestIdProperty()
  requestId: string; //"assign-20251104-0002",

  @DeviceIdProperty()
  deviceId: string; // Request from specific device

  @TimeStampProperty()
  timestamp: number;

  @ApiProperty({
    description: 'Telemetry metric type',
    enum: TelemetryMetric,
    example: TelemetryMetric.Temperature,
  })
  @IsEnum(TelemetryMetric)
  metric: TelemetryMetric;

  @RequiredNumberApiProperty({ description: 'Measured value', example: 24.5 })
  value: number;

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
