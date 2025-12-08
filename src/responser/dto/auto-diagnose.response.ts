// src/device/dto/auto-diagnostic-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DiagnosticComponent } from 'src/config/enum/diagnostic-component.enum';
import { IsValidEpochMillis } from 'src/config/decorator/uptime-validation.decorator';
import { DiagnosticLevel } from 'src/config/enum/diagnostic-Level.enum';
import { ResponseMessageCode } from '../../common/enum/response-message-code.enum';

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

  @ApiProperty({
    description: 'Optional details or error messages',
    required: false,
  })
  @IsOptional()
  @IsString()
  details?: string;
}

export class AutoDiagnosticResponseDto {
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
    example: ResponseMessageCode.RESPONSE_AUTO_DIAGNOSTIC,
  })
  @IsNotEmpty()
  @IsNumber()
  responseCode: number;

  @ApiProperty({
    description: 'Unique identifier for the request',
    example: 'req-ad-852',
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
    description: 'Time of diagnostic completion in epoch milliseconds',
    example: 1762379573804,
  })
  @IsValidEpochMillis()
  @IsNotEmpty()
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
