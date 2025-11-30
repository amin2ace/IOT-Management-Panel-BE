import { Role } from '@/config/types/roles.types';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

/**
 * User Response DTO
 * Used for serializing user data in create/login responses
 * Excludes sensitive information like password
 */
export class UserResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Unique user identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId: string;

  @Expose()
  @ApiProperty({
    description: 'User email address',
    example: 'john@example.com',
  })
  email: string;

  @Expose()
  @ApiProperty({
    description: 'User display name',
    example: 'John Doe',
  })
  username: string;

  @Expose()
  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  firstName?: string;

  @Expose()
  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  lastName?: string;

  @Expose()
  @ApiProperty({
    description: 'Profile photo URL',
    example: 'https://example.com/photos/john.jpg',
    required: false,
  })
  photoUrl?: string;

  @Expose()
  @ApiProperty({
    description: 'User active status',
    example: true,
  })
  isActive: boolean;

  @Expose()
  @ApiProperty({
    description: 'User roles for RBAC',
    enum: Role,
    isArray: true,
    example: [Role.VIEWER],
  })
  roles: Role[];

  @Expose()
  @ApiProperty({
    description: 'User registration date',
    example: '2023-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: 'Last profile update date',
    example: '2023-12-01T14:22:00.000Z',
  })
  updatedAt: Date;

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
