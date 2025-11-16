import { ISessionData } from '@/session/interface/session-service.interface';
import { Role } from '@/config/types/roles.types';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class SessionCache implements ISessionData {
  @Expose()
  @ApiProperty({
    description: 'Unique user identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId: string;

  @Expose()
  @ApiProperty({
    description: 'User display name',
    example: 'John Doe',
  })
  username: string;

  @Expose()
  @ApiProperty({
    description: 'User roles for RBAC',
    enum: Role,
    isArray: true,
    example: [Role.VIEWER],
  })
  roles: Role[];

  @IsString()
  ipAddress: string;

  @IsString()
  userAgent: string;

  @IsString()
  loginTime: Date;

  @IsString()
  lastActivity: Date;
}
