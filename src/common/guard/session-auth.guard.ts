import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { SessionService } from '../../auth/session.service';
import { Request, Response } from 'express';

/**
 * SessionAuthGuard - Validates session-based authentication
 *
 * Flow:
 * 1. Extract sessionId from cookies
 * 2. Validate session exists in Redis
 * 3. If valid: Extend TTL and attach user data to request
 * 4. If invalid: Return 401 Unauthorized
 * 5. Attach req.user and req.roles for downstream use (RolesGuard, controllers)
 *
 * Usage in module:
 * ```
 * app.useGlobalGuards(new SessionAuthGuard(sessionService));
 * // Or on specific routes:
 * @UseGuards(SessionAuthGuard)
 * ```
 */
@Injectable()
export class SessionAuthGuard implements CanActivate {
  private readonly logger = new Logger(SessionAuthGuard.name, {
    timestamp: true,
  });
  private readonly SESSION_COOKIE_NAME = 'sessionId';

  constructor(private readonly sessionService: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Extract sessionId from cookies
    const sessionId = request.cookies[this.SESSION_COOKIE_NAME];

    if (!sessionId) {
      this.logger.warn('No session ID found in cookies');
      throw new UnauthorizedException('Session not found. Please login.');
    }

    try {
      // Get session data from Redis
      let sessionData = await this.sessionService.getSession(sessionId);

      if (!sessionData) {
        this.logger.warn(`Invalid session ID: ${sessionId}`);
        throw new UnauthorizedException(
          'Session expired or invalid. Please login again.',
        );
      }

      // Extend session TTL and update lastActivity
      sessionData = await this.sessionService.extendSession(sessionId);

      if (!sessionData) {
        throw new UnauthorizedException(
          'Failed to extend session. Please login again.',
        );
      }

      // Attach user data to request for use in controllers
      (request as any).user = {
        userId: sessionData.userId,
        userName: sessionData.userName,
        roles: sessionData.roles,
        loginTime: sessionData.loginTime,
        lastActivity: sessionData.lastActivity,
      };

      // Attach roles separately for RolesGuard
      (request as any).roles = sessionData.roles;

      // Attach sessionId for logout operations
      (request as any).sessionId = sessionId;

      console.log('SessionAuthGuard attaching to request:', {
        userId: sessionData.userId,
        roles: sessionData.roles,
      });

      this.logger.debug(
        `Session validated for user: ${sessionData.userId} with roles: ${sessionData.roles.join(', ')}`,
      );

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(`Session validation error: ${error.message}`);
      throw new UnauthorizedException(
        'Authentication failed. Please login again.',
      );
    }
  }
}
