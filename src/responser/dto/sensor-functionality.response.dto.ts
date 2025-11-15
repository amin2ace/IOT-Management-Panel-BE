import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  IsNotEmpty,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { AckStatus } from 'src/config/enum/ack-status.enum';
import { DeviceCapabilities } from 'src/config/enum/sensor-type.enum';
import { ResponseMessageCode } from '../../common/enum/response-message-code.enum';

export class SensorFunctionalityResponseDto {
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
    example: ResponseMessageCode.DEVICE_FUNCTION_ASSIGNED,
  })
  @IsNotEmpty()
  @IsNumber()
  responseCode: number;

  @ApiProperty({
    description: 'Unique identifier for the request',
    example: 'req-sf-39',
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
    description: 'Provisioned functionalities',
    enum: DeviceCapabilities,
    isArray: true,
    example: [DeviceCapabilities.TEMPERATURE],
  })
  @IsArray()
  @IsNotEmpty()
  functionality: DeviceCapabilities[];

  @ApiProperty({
    description: 'Provisioning status message',
    enum: AckStatus,
    example: AckStatus.ACCEPTED,
  })
  @IsEnum(AckStatus)
  status: AckStatus;
}

/**
    Example:
      {
        "userId": "user-001",
        "responseId": "fw-20251104-status",
        "responseCode": 201,
        "requestId": "req-sf-39",
        "deviceId": "sensor-67890",
        "functionality": ["TEMPERATURE"],
        "status": "accepted"
      }

 */
