import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class DeviceLocationDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  site?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  floor?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  unit?: string;
}
