import { Role } from '@/config/types/roles.types';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

/**
 * User Response DTO
 * Used for serializing user data in create/login responses
 * Excludes sensitive information like password
 */
export class UserResponseDto {
  @ApiProperty({
    description: 'Unique user identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User display name',
    example: 'John Doe',
  })
  userName: string;

  @ApiProperty({
    description: 'User active status',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'User roles for RBAC',
    enum: Role,
    isArray: true,
    example: [Role.VIEWER],
  })
  roles: Role[];

  @Exclude()
  password?: string;

  @Exclude()
  _id?: any;
}

/**
 * User Create/Login Response DTO
 * Extends UserResponseDto with authentication token
 */
export class UserAuthResponseDto extends UserResponseDto {
  @ApiProperty({
    description: 'JWT authentication token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken?: string;

  @ApiProperty({
    description: 'Refresh token for token renewal',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken?: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
  })
  expiresIn?: number;
}
