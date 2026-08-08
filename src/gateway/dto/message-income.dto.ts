import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SensorDataDto } from './sensor-data.dto';
import { RequiredStringApiProperty } from '@/common/decorator/api-properties';
import { OptionalNumberApiProperty } from '@/common/decorator/api-properties/optional-number-property.decorator';

export enum MessageFormat {
  JSON = 'json',
  TEXT = 'text',
  BINARY = 'binary',
}

export class IncomeMessageDto {
  @RequiredStringApiProperty({
    description: 'MQTT topic where message was received',
    example: 'sensors/temperature/room1',
  })
  topic!: string;

  @RequiredStringApiProperty({
    description: 'Raw message data as string',
    example: '{"value": 25.5, "unit": "°C", "deviceId": "temp1"}',
  })
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

  @OptionalNumberApiProperty({
    description: 'Size of the message in bytes',
    example: 128,
  })
  messageSize?: number;

  @OptionalNumberApiProperty({
    description: 'Quality score based on data validation',
    minimum: 0,
    maximum: 1,
    example: 0.95,
  })
  qualityScore?: number;
}
