import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MqttPublishDto {
  @ApiProperty({ default: 'test/topic' })
  @IsString()
  @IsNotEmpty()
  topic: string;

  @ApiProperty({ default: 'Test Message' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
