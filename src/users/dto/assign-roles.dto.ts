import { IsArray, IsEnum, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Role } from '@/config/types/roles.types';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for assigning/updating user roles
 * Can be used to:
 * - Assign new roles to a user
 * - Override existing roles completely
 */
export class AssignRolesDto {
  @ApiProperty({
    description: 'Array of roles to assign to the user',
    enum: Role,
    isArray: true,
    example: [Role.VIEWER, Role.ENGINEER],
    minItems: 1,
    maxItems: Object.keys(Role).length,
  })
  @IsArray({
    message: 'Roles must be an array',
  })
  @IsEnum(Role, {
    each: true,
    message: `Each role must be one of: ${Object.values(Role).join(', ')}`,
  })
  @ArrayMinSize(1, {
    message: 'At least one role is required',
  })
  @ArrayMaxSize(Object.keys(Role).length, {
    message: `Maximum ${Object.keys(Role).length} roles allowed`,
  })
  roles: Role[];
}
