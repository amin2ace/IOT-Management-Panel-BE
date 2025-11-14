import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ControlDeviceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  command: string;
}
