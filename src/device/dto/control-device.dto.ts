import { IsString, IsNotEmpty } from 'class-validator';

export class ControlDeviceDto {
  @IsString()
  @IsNotEmpty()
  command: string;
}
