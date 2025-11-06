import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MqttSubscribeDto {
  @ApiProperty({ default: 'test/topic' })
  @IsString()
  @IsNotEmpty()
  topic: string;

  @ApiProperty({ default: 'asfewoe9wefwef9' })
  @IsString()
  @IsNotEmpty()
  deviceId: string;
}
