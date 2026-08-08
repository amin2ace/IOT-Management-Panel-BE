import { OptionalNumberApiProperty } from '@/common/decorator/api-properties/optional-number-property.decorator';
import { OptionalStringApiProperty } from '@/common/decorator/api-properties/optional-string-property.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
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

  @OptionalNumberApiProperty({
    description: 'Enable serial debug output',
    example: 96000,
    required: false,
  })
  buadrate?: number;

  @OptionalStringApiProperty({
    description: 'EExternal log server address',
    example: 'https://log.server.com:8888',
    required: false,
  })
  externalServer?: string;
}
