import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { AckStatus } from 'src/config/enum/ack-status.enum';

export class AckResponseDto {
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

  @ApiProperty({ description: 'Time of the request', example: '' })
  @IsDate()
  @IsNotEmpty()
  timestamp: Date; // Epoch time: ISO8601

  @ApiProperty({
    description: 'Response message',
    example:
      'assigned TEMPERATURE, publishing to sensors/client-123/temperature/sensor-001',
  })
  @IsString()
  @IsNotEmpty()
  details: string; //"assigned TEMPERATURE, publishing to sensors/client-123/temperature/sensor-001"
}
