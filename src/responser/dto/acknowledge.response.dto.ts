import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { IsValidTimestampMillis } from 'src/config/decorator/timestamp-validation.decorator';
import { AckStatus } from 'src/config/enum/ack-status.enum';
import { ResponseMessageCode } from '../../common/enum/response-message-code.enum';

export class AckResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user who initiated the request',
    example: 'user-001',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Unique identifier for the response',
    example: 'res-12346',
  })
  @IsString()
  @IsNotEmpty()
  responseId: string;

  @ApiProperty({
    description: 'Numeric code representing the response type',
    example: ResponseMessageCode.SENSOR_CONFIGURATION_ACKNOWLEDGEMENT,
  })
  @IsNumber()
  @IsNotEmpty()
  responseCode: number; // Request Message Code

  @ApiProperty({
    description: 'Unique identifier for requested message',
    example: 'req-12345',
  })
  @IsString()
  @IsNotEmpty()
  requestId: string; //"assign-20251104-0002",

  @ApiProperty({
    description: 'Unique identifier of the sensor',
    example: 'sensor-67890',
  })
  @IsString()
  deviceId: string; // Request from specific device

  @ApiProperty({
    description: 'The acknowledgement state of the request',
    enum: AckStatus, // the enum itself
    enumName: 'AckStatus', // optional but helps Swagger
    example: [AckStatus.ACCEPTED], // optional example
  })
  @IsEnum(AckStatus)
  @IsNotEmpty()
  ackStatus: AckStatus; //"ACCEPTED",

  @ApiProperty({
    description: 'Time of the request in epoch milli second',
    example: '1762379573804',
  })
  @IsValidTimestampMillis() // 5min behind, 30sec ahead
  timestamp: number;

  @ApiProperty({
    description: 'Response message',
    example:
      'assigned TEMPERATURE, publishing to sensors/client-123/temperature/sensor-001',
  })
  @IsString()
  @IsNotEmpty()
  details: string; //"assigned TEMPERATURE, publishing to sensors/client-123/temperature/sensor-001"
}

/**
    Example:
      {
        "userId": "user-001",
        "responseId": "res-12346",
        "responseCode": 202,
        "requestId": "req-12345",
        "deviceId": "sensor-67890",
        "ackStatus": "ACCEPTED",
        "timestamp": 1762379573804,
        "details": "Assigned TEMPERATURE metric successfully, publishing to sensors/client-123/temperature/sensor-001"
      }

 */
