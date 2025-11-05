import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class OtaConfigDto {
  @IsBoolean()
  @IsNotEmpty()
  enabled: boolean;

  @IsOptional()
  @IsString()
  url?: string;
}
