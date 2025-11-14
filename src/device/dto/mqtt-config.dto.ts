import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MqttConfigDto {
  @ApiProperty({
    description: 'MQTT broker URL',
    example: 'mqtt://192.168.1.10:1883',
  })
  @IsOptional()
  @IsString()
  broker?: string;

  @ApiProperty({ description: 'MQTT username', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ description: 'MQTT password', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({
    description: 'Base MQTT topic for broadcasting',
    example: 'greeenHouse_jolfa/broadcast',
  })
  @IsString()
  @IsNotEmpty()
  broadcastTopic: string;
}
