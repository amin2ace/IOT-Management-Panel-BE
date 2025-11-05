import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class LoggingConfigDto {
  @IsIn(['debug', 'info', 'warn', 'error'])
  @IsNotEmpty()
  level: 'debug' | 'info' | 'warn' | 'error';

  @IsBoolean()
  @IsNotEmpty()
  enableSerial: boolean;

  @IsNumber()
  @IsOptional()
  buadrate?: number;

  @IsString()
  @IsOptional()
  externalServer?: string;
}
