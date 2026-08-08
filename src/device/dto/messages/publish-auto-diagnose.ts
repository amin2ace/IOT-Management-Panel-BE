import {
  DeviceIdProperty,
  RequestCodeProperty,
  RequestIdProperty,
  TimeStampProperty,
  UserIdProperty,
} from '@/common/decorator/api-properties';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray, IsNotEmpty, IsEnum } from 'class-validator';
import { DiagnosticComponent } from 'src/config/enum/diagnostic-component.enum';
import { DiagnosticLevel } from 'src/config/enum/diagnostic-Level.enum';

export class PublishAutoDiagDto {
  @UserIdProperty()
  userId: string;

  @RequestIdProperty()
  requestId: string;

  @RequestCodeProperty()
  requestCode: string; // Request Message Code

  @DeviceIdProperty()
  deviceId: string; // Request from specific device

  @TimeStampProperty()
  timestamp: number;

  @ApiProperty({
    description: 'Diagnostic level',
    enum: DiagnosticLevel,
    required: false,
    example: DiagnosticLevel.FULL,
  })
  @IsNotEmpty()
  @IsEnum(DiagnosticLevel)
  diagnosticLevel: DiagnosticLevel;

  @ApiProperty({
    description: 'Select specific components for diagnostic',
    required: false,
    enum: DiagnosticComponent,
    isArray: true,
    example: [DiagnosticComponent.WIFI, DiagnosticComponent.SENSORS],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(DiagnosticComponent, { each: true })
  components?: string[];
}

/**
  Example:
    {
      "userId": "user-001",
      "requestId": "req-ad-852",
      "requestCode": 106,
      "deviceId": "sensor-67890",
      "timestamp": 1762379573804,
      "diagnosticLevel": "FULL",
      "components": ["WIFI", "SENSORS"]
    }
 */
