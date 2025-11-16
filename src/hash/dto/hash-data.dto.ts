import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class HashDto {
  @ApiProperty({ default: 'John Wick' })
  @IsString()
  userName?: string;

  @ApiProperty({ default: 'john@wick.com' })
  @IsString()
  email?: string;

  @ApiProperty({ default: '123456789' })
  @IsString()
  password?: string;
}
