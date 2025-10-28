import { IsNotEmpty, IsString } from 'class-validator';

export class MqttSubscribeDto {
  @IsString()
  @IsNotEmpty()
  topic: string;
}
