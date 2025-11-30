import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsJSON,
  IsNotEmpty,
  IsString,
  IsObject,
  IsEnum,
  IsNumber,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SensorDataDto, DataQuality } from './sensor-data.dto';

export enum MessageFormat {
  JSON = 'json',
  TEXT = 'text',
  BINARY = 'binary',
}

export class IncomeMessageDto {
  @ApiProperty({
    description: 'MQTT topic where message was received',
    example: 'sensors/temperature/room1',
  })
  @IsString()
  @IsNotEmpty()
  topic!: string;

  @ApiProperty({
    description: 'Raw message data as string',
    example: '{"value": 25.5, "unit": "°C", "deviceId": "temp1"}',
  })
  @IsString()
  @IsNotEmpty()
  rawData!: string;

  @ApiProperty({
    description: 'Parsed and validated sensor data',
    type: SensorDataDto,
  })
  @ValidateNested()
  @Type(() => SensorDataDto)
  parsedData!: SensorDataDto;

  @ApiProperty({
    description: 'Server timestamp when message was received',
    example: '2023-12-07T10:30:00.000Z',
  })
  @IsNotEmpty()
  timestamp!: Date;

  @ApiProperty({
    description: 'Format of the incoming message',
    enum: MessageFormat,
    example: MessageFormat.JSON,
  })
  @IsEnum(MessageFormat)
  messageFormat!: MessageFormat;

  @ApiPropertyOptional({
    description: 'Size of the message in bytes',
    example: 128,
  })
  @IsNumber()
  @IsOptional()
  messageSize?: number;

  @ApiPropertyOptional({
    description: 'Quality score based on data validation',
    minimum: 0,
    maximum: 1,
    example: 0.95,
  })
  @IsNumber()
  @IsOptional()
  qualityScore?: number;
}
