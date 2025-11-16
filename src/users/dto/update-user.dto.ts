import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ default: 'John Wick' })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ default: 'john@wick.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ default: '123456789' })
  @IsString()
  @IsOptional()
  password?: string;
}
