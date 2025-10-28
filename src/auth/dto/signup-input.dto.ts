import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignupInputDto {
  @ApiProperty({ default: 'John Wick' })
  @IsString()
  userName: string;

  @ApiProperty({ default: 'john@wick.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ default: '123456789' })
  @IsString()
  password: string;
}
