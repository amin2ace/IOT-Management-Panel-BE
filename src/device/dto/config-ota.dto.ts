import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class OtaConfigDto {
  @ApiProperty({
    description: 'Enable OTA updates',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiProperty({ description: 'OTA firmware URL', required: false })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({ description: 'Ota Check intervals', required: false })
  @IsOptional()
  @IsNumber()
  checkInterval?: number;
}
