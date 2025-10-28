import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class loginInputDto {
  @ApiProperty({ default: 'john@wick.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ default: '123456789' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
