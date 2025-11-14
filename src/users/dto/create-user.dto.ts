import { Role } from '@/config/types/roles.types';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ default: 'John Wick' })
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty({ default: 'john@wick.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ default: '123456789' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: 'User role for RBAC',
    enum: Role,
    enumName: 'Role',
    isArray: true,
    example: [Role.VIEWER],
  })
  @IsEnum(Role)
  @IsArray()
  @IsNotEmpty()
  roles: Role[];
}
