import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { LogLevel } from 'src/config/enum/log-level.enum';

export class LoggingConfigDto {
  @ApiProperty({
    description: 'Logging level',
    example: LogLevel.INFO,
    enum: LogLevel,
    enumName: 'LogLevel',
    required: false,
  })
  @IsEnum(LogLevel)
  @IsOptional()
  level?: LogLevel;

  @ApiProperty({
    description: 'Enable serial debug output',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  enableSerial?: boolean;

  @ApiProperty({
    description: 'Enable serial debug output',
    example: 96000,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  buadrate?: number;

  @ApiProperty({
    description: 'EExternal log server address',
    example: 'https://log.server.com:8888',
    required: false,
  })
  @IsString()
  @IsOptional()
  externalServer?: string;
}
