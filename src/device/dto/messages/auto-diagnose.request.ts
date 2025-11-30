import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { IsValidTimestampMillis } from 'src/config/decorator/timestamp-validation.decorator';
import { DiagnosticComponent } from 'src/config/enum/diagnostic-component.enum';
import { DiagnosticLevel } from 'src/config/enum/diagnostic-Level.enum';
import { RequestMessageCode } from '../../../common/enum/request-message-code.enum';

export class AutoDiagnosticRequestDto {
  @ApiProperty({
    description: 'Unique identifier of the user who initiated the request',
    example: 'user-001',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Unique identifier for the request',
    example: 'req-ad-852',
  })
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty({
    description: 'Numeric code representing the request type',
    example: RequestMessageCode.AUTO_DIAGNOSTIC,
  })
  @IsNumber()
  @IsNotEmpty()
  requestCode: number; // Request Message Code

  @ApiProperty({
    description: 'Unique identifier of the device',
    example: 'sensor-67890',
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string; // Request from specific device

  @ApiProperty({
    description: 'Time of the request in epoch milli second',
    example: '1762379573804',
  })
  @IsValidTimestampMillis() // 5min behind, 30sec ahead
  @IsNotEmpty()
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
