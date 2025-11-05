import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MqttConfigDto {
  @IsString()
  @IsNotEmpty()
  broker: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsString()
  @IsNotEmpty()
  broadcastTopic: string;
}
