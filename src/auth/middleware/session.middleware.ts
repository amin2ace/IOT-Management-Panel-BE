import { SessionService } from '@/session/session.service';
import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  constructor(private readonly sessionService: SessionService) {}
  private readonly SESSION_COOKIE_NAME = 'sessionId';

  async use(req: Request, res: Response, next: () => void) {
    const sessionId = req.cookies[this.SESSION_COOKIE_NAME];

    if (!sessionId) {
      throw new UnauthorizedException('Session ended');
    }

    const data = await this.sessionService.getSession(sessionId);

    if (data === null) {
      throw new UnauthorizedException('Session empty');
    }

    (req as any).user = {
      userId: data.userId,
      username: data.username,
      userAgent: data.userAgent,
      userIp: data.ipAddress,
      userLoginTime: data.loginTime,
      userLastActivity: data.lastActivity,
      roles: data.roles,
    };

    next();
  }
}
