import { Role } from '@/config/types/roles.types';
import { Expose } from 'class-transformer';

export class RolesResponseDto {
  @Expose()
  userId: string;

  @Expose()
  roles: Role[];
}
