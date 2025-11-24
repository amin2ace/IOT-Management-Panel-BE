import { Role } from '@/config/types/roles.types';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsUrl,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User display name (3-20 characters)',
    example: 'John Wick',
    required: false,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers and underscores',
  })
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@wick.com',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'User password (min 8 characters)',
    example: '123456789',
    required: false,
  })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @ApiProperty({
    description: 'User first name (2-50 characters)',
    example: 'John',
    required: false,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'User last name (2-50 characters)',
    example: 'Wick',
    required: false,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'Profile photo URL',
    example: 'https://example.com/photos/john.jpg',
    required: false,
  })
  @IsUrl()
  @IsOptional()
  photoUrl?: string;

  @ApiProperty({
    description: 'User roles for RBAC',
    isArray: true,
    example: [Role.VIEWER, Role.ADMIN],
    required: false,
  })
  @IsArray()
  @IsOptional()
  roles?: Role[];
}
