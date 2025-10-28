import { Request, Response } from "express";
import { TokenType } from "src/config/enum/token-type.enum";

export interface ICookieService {
  setTokensCookie(
    res: Response,
    tokenType: TokenType,
    token: string
  ): Promise<string>;

  getRefreshTokenFromCookie(
    req: Request,
    tokenType: TokenType
  ): Promise<{ refreshToken: string }>;

  clearCookie(res: Response, tokenType: TokenType): Promise<string>;
}
