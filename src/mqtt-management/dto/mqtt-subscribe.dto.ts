import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { QoS } from 'src/config/types/mqtt.types';

export class MqttSubscribeDto {
  @ApiProperty({ default: 'test/topic' })
  @IsString()
  @IsNotEmpty()
  topic: string;

  @ApiProperty({ enum: QoS, default: QoS.AtMostOnce })
  @IsNumber()
  @IsNotEmpty()
  qos: QoS;
}
