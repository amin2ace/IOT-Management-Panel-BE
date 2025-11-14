// src/auth/guards/roles.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/config/decorator/roles.decorator';
import { Role } from 'src/config/types/roles.types';

/**
 * RolesGuard - Validates that authenticated user has required roles
 *
 * Flow:
 * 1. Extract required roles from @Roles() decorator
 * 2. If no @Roles() decorator: Allow access (public endpoint or no role restriction)
 * 3. Get user roles from request (attached by SessionAuthGuard or JwtAuthGuard)
 * 4. If no user: Deny access (401 - should be caught by auth guard)
 * 5. Check if user has any of the required roles
 * 6. If yes: Allow access
 * 7. If no: Deny with 403 Forbidden
 *
 * Usage:
 * ```
 * @Controller('/api/users')
 * @Roles(Role.ADMIN, Role.SUPER_ADMIN)
 * export class UsersController {
 *   @Post()
 *   @Roles(Role.SUPER_ADMIN)  // More restrictive than class-level
 *   createUser() {}
 *
 *   @Get()
 *   @Roles(Role.ADMIN, Role.SUPER_ADMIN)
 *   getUsers() {}
 * }
 * ```
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles from @Roles() decorator
    // Check both handler-level and class-level decorators
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no @Roles() decorator: Allow access (endpoint is public or no role restriction)
    if (!requiredRoles || requiredRoles.length === 0) {
      this.logger.debug('No role requirement found - allowing access');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRoles = (request as any).roles as Role[] | undefined;
    const userId = (request as any).user?.userId;
    console.log('RolesGuard - request:', userRoles, userId);

    // If no user in request, deny access
    // (This should normally be caught by authentication guard first)
    if (!userRoles || userRoles.length === 0) {
      this.logger.warn(
        `Access denied - no user roles in request. User: ${userId}`,
      );
      throw new ForbiddenException('Access denied - no user roles found');
    }

    // Check if user has any of the required roles
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      this.logger.warn(
        `Access denied - insufficient roles. User: ${userId}, Required: ${requiredRoles.join(', ')}, Has: ${userRoles.join(', ')}`,
      );
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}. Your roles: ${userRoles.join(', ')}`,
      );
    }

    this.logger.debug(
      `Access granted to user: ${userId} with roles: ${userRoles.join(', ')}`,
    );
    return true;
  }
}
