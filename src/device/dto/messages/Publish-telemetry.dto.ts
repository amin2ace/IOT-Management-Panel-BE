import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { IsValidTimestampMillis } from 'src/config/decorator/timestamp-validation.decorator';
import { RequestMessageCode } from '../../../common/enum/request-message-code.enum';

export class PublishTelemetryDto {
  @ApiProperty({
    description: 'Unique identifier of the user who initiated the request',
    example: 'user-001',
  })
  @IsNotEmpty()
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Numeric code representing the request type',
    example: RequestMessageCode.REQUEST_TELEMETRY_DATA,
  })
  @IsNotEmpty()
  @IsNumber()
  requestCode: number; // Request Message Code

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
    description: 'Time of the request in epoch milli second',
    example: '1762379573804',
  })
  @IsValidTimestampMillis() // 5min behind, 30sec ahead
  timestamp: number;
}

/**
  Example:
    {
      "userId": "user-001",
      "requestCode": 111,
      "requestId": "fw-t-43",
      "deviceId": "sensor-67890",
      "timestamp": 1762379573804
    }
      
 */
