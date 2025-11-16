import { Role } from '@/config/types/roles.types';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsArray()
  @IsNotEmpty()
  roles: Role[];

  @IsString()
  @IsNotEmpty()
  ipAddress: string;

  @IsString()
  @IsNotEmpty()
  userAgent: string;
}
