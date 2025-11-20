import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { CookieOptions, Request, Response } from 'express';
import { ICookieService } from './interface/cookie-service.interface';
import { TokenType } from 'src/config/enum/token-type.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CookieService implements ICookieService {
  private readonly logger = new Logger(CookieService.name, { timestamp: true });
  private readonly sessionCookieName: string;
  private readonly EXPIRE_DATE = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now
  constructor(private readonly configService: ConfigService) {
    configService.getOrThrow<string>('SESSION_COOKIE_NAME');
  }

  async setTokensCookie(
    res: Response,
    tokenType: TokenType,
    token: string,
  ): Promise<string> {
    try {
      const cookieOptions: CookieOptions = {
        httpOnly: true,
        // secure: true,
        sameSite: 'strict',
        maxAge:
          tokenType === TokenType.ACCESS
            ? 15 * 60 * 1000 // 15 minutes for access token
            : 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
      };
      const refreshToken = token.split('.')[0];
      res.cookie(tokenType, refreshToken, cookieOptions);
      // console.log({ refreshTokenInCookie: refreshToken });
      return `Cookie for ${tokenType} set successfully`;
    } catch (error) {
      throw new ForbiddenException('Set Tokens Cookie Failed');
    }
  }

  async getRefreshTokenFromCookie(
    req: Request,
    tokenType: TokenType,
  ): Promise<{ refreshToken: string }> {
    const refreshToken = req.cookies[tokenType];
    // console.log({ refreshTokenInCookie: refreshToken });

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    return { refreshToken };
  }

  async clearCookie(res: Response, key: string) {
    try {
      res.cookie(key, '', {
        httpOnly: true,
        // secure: true,
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
      });

      return `Cookie Cleared`;
    } catch (error) {
      throw new ForbiddenException('Clear Cookie Failed');
    }
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Set secure session cookie
   */
  async setSessionCookie(res: Response, sessionId: string): Promise<void> {
    res.cookie(this.sessionCookieName, sessionId, {
      httpOnly: true, // Prevent XSS (JS cannot access)
      secure:
        this.configService.getOrThrow<string>('NODE_ENV') === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      // maxAge: 24 * 60 * 60 * 1000, // 24 hours
      expires: this.EXPIRE_DATE,
      path: '/', // Available for all routes
    });
    this.logger.debug(`Session cookie set for session id: ${sessionId}`);
  }

  /**
   * Clear session cookie
   */
  async clearSessionCookie(res: Response): Promise<void> {
    res.clearCookie(this.sessionCookieName, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
    });
    this.logger.debug('Session cookie cleared');
  }
}
