import { RequiredStringApiProperty } from '@/common/decorator/api-properties/required-string-property.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class SignupDto {
  @RequiredStringApiProperty({ default: 'John Wick' })
  username: string;

  @ApiProperty({ default: 'john@wick.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @RequiredStringApiProperty({ default: '123456789' })
  password: string;
}
