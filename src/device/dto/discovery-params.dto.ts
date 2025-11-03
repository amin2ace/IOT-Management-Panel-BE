import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeviceDiscoveryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  mqttBrokerUrl: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  topicWildCard: string;
}
