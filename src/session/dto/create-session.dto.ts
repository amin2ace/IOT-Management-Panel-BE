import { RequiredStringApiProperty } from '@/common/decorator/api-properties';
import { Role } from '@/config/types/roles.types';
import { IsArray, IsNotEmpty } from 'class-validator';

export class CreateSessionDto {
  @RequiredStringApiProperty()
  userId: string;

  @RequiredStringApiProperty()
  username: string;

  @IsArray()
  @IsNotEmpty()
  roles: Role[];

  @RequiredStringApiProperty()
  ipAddress: string;

  @RequiredStringApiProperty()
  userAgent: string;
}
