import { Role } from '@/config/types/roles.types';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ default: 'John Wick' })
  @IsString()
  @IsNotEmpty()
  username: string;

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
    isArray: true,
    example: [Role.VIEWER, Role.ADMIN],
  })
  @IsArray()
  @IsNotEmpty()
  roles: Role[];

  @ApiProperty({
    description: 'User first name',
    required: false,
    example: 'John',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    required: false,
    example: 'Wick',
  })
  @IsString()
  @IsOptional()
  lastName?: string;
}

// Use this in your controller with @UseInterceptors(FileInterceptor('photo'))
