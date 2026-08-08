import { Request, Response } from 'express';
import { TokenType } from 'src/config/enum/token-type.enum';

export interface ICookieService {
  /**
   * Set token parameters in cookie
   * @param res
   * @param tokenType
   * @param token
   */
  setTokensCookie(
    res: Response,
    tokenType: TokenType,
    token: string,
  ): Promise<string>;
  /**
   * Retrieve token from cookie
   * @param req
   * @param tokenType
   */
  getRefreshTokenFromCookie(
    req: Request,
    tokenType: TokenType,
  ): Promise<{ refreshToken: string }>;
  /**
   * Clear all cookie entries
   * @param res
   * @param tokenType
   */
  clearCookie(res: Response, tokenType: TokenType): Promise<string>;
  /**
   * Set session id in cookie
   * @param res
   * @param sessionId
   */
  setSessionCookie(res: Response, sessionId: string): Promise<void>;
  /**
   * Clear session id from cookie
   * @param res
   */
  clearSessionCookie(res: Response): Promise<void>;
}
