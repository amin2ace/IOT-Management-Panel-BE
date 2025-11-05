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
  })
  @IsEnum(LogLevel)
  @IsNotEmpty()
  level: LogLevel;

  @ApiProperty({ description: 'Enable serial debug output', example: true })
  @IsBoolean()
  @IsNotEmpty()
  enableSerial: boolean;

  @ApiProperty({
    description: 'Enable serial debug output',
    required: false,
    example: 96000,
  })
  @IsNumber()
  @IsOptional()
  buadrate?: number;

  @ApiProperty({
    description: 'EExternal log server address',
    required: false,
    example: 'https://log.server.com:8888',
  })
  @IsString()
  @IsOptional()
  externalServer?: string;
}
