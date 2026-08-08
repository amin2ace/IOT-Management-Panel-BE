// src/device/dto/auto-diagnostic-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { DiagnosticComponent } from 'src/config/enum/diagnostic-component.enum';
import { DiagnosticLevel } from 'src/config/enum/diagnostic-Level.enum';

import {
  DeviceIdProperty,
  OptionalStringApiProperty,
  RequestIdProperty,
  ResponseCodeProperty,
  ResponseIdProperty,
  TimeStampProperty,
  UserIdProperty,
} from '@/common/decorator/api-properties';

export enum DiagnosticStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PARTIAL = 'partial',
}

export class ComponentDiagnosticResultDto {
  @ApiProperty({ description: 'Component name', enum: DiagnosticComponent })
  @IsEnum(DiagnosticComponent)
  component: DiagnosticComponent;

  @ApiProperty({
    description: 'Result of the diagnostic for this component',
    enum: DiagnosticStatus,
  })
  @IsEnum(DiagnosticStatus)
  status: DiagnosticStatus;

  @OptionalStringApiProperty({
    description: 'Optional details or error messages',
    required: false,
  })
  details?: string;
}

export class AutoDiagnosticResponseDto {
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
    description: 'Diagnostic level used for this check',
    enum: DiagnosticLevel,
    example: DiagnosticLevel.FULL,
  })
  @IsEnum(DiagnosticLevel)
  diagnosticLevel: DiagnosticLevel;

  @ApiProperty({
    description: 'Overall status of the diagnostic',
    enum: DiagnosticStatus,
    example: DiagnosticStatus.SUCCESS,
  })
  @IsEnum(DiagnosticStatus)
  diagStatus: DiagnosticStatus;

  @ApiProperty({
    description: 'Results per component',
    type: [ComponentDiagnosticResultDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComponentDiagnosticResultDto)
  results?: ComponentDiagnosticResultDto[];
}

/**
  Example:
    {
      "userId": "user-001",
      "responseId": "res-56789",
      "responseCode": 206,
      "requestId": "req-ad-852",
      "deviceId": "sensor-67890",
      "timestamp": 1762379573804,
      "diagnosticLevel": "full",
      "diagStatus": "success",
      "results": [
        {
          "component": "wifi",
          "status": "success",
          "details": "WiFi connection stable, signal strength 78%"
        },
        {
          "component": "sensors",
          "status": "partial",
          "details": "Temperature sensor OK, humidity sensor error"
        },
        {
          "component": "memory",
          "status": "success",
          "details": "Memory usage normal, no leaks detected"
        },
        {
          "component": "mqtt",
          "status": "success",
          "details": "MQTT broker reachable, last publish successful"
        }
      ]
    }
 */
