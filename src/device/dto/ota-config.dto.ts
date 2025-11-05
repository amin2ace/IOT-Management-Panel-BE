import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class OtaConfigDto {
  @ApiProperty({ description: 'Enable OTA updates', example: true })
  @IsBoolean()
  @IsNotEmpty()
  enabled: boolean;

  @ApiProperty({ description: 'OTA firmware URL', required: false })
  @IsOptional()
  @IsString()
  url?: string;
}
