import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { QoS } from 'src/config/types/mqtt-qos.types';

export class MqttPublishDto {
  @ApiProperty({ default: 'test/topic' })
  @IsString()
  @IsNotEmpty()
  topic: string;

  @ApiProperty({ default: 'Test Message' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ enum: QoS, default: QoS.AtMostOnce })
  @IsNumber()
  @IsNotEmpty()
  qos: QoS;

  @ApiProperty({ type: 'boolean', default: false })
  @IsBoolean()
  @IsNotEmpty()
  retain: boolean;
}
