import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CookieOptions, Request, Response } from 'express';
import { ICookieService } from './interface/cookie-service.interface';
import { TokenType } from 'src/config/enum/token-type.enum';

@Injectable()
export class CookieService implements ICookieService {
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
      });

      return `Cookie Cleared`;
    } catch (error) {
      throw new ForbiddenException('Clear Cookie Failed');
    }
  }
}
