import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { IsValidEpochMillis } from 'src/config/decorator/uptime-validation.decorator';
import { ConnectionState } from 'src/config/enum/connection-state.enum';

export class HeartBeatDto {
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
    description: 'Unique identifier of the sensor',
    example: 'sensor-67890',
  })
  @IsString()
  deviceId: string; // Request from specific device

  @ApiProperty()
  @IsEnum(ConnectionState)
  connectionState: ConnectionState;

  @IsValidEpochMillis({ message: 'Uptime must be valid epoch milliseconds' })
  uptime: number;

  @ApiProperty({
    description: 'Wifi Received Signal Strength Indicator',
    example: '-52',
  })
  @IsString()
  @IsNotEmpty()
  wifiRssi: number;
}
