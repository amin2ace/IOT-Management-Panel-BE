import { TokenType } from 'src/config/enum/token-type.enum';

export interface ITokenService {
  generateAccessToken(
    userId: string,
    type: TokenType,
  ): Promise<{ accessToken: string }>;

  generateRefreshToken(
    userId: string,
    type: TokenType,
  ): Promise<{ refreshToken: string }>;

  storeRefreshToken(userId: string, token: string): Promise<void>;

  storeAccessTokenInBlacklist(accessToken: string): Promise<void>;

  validateRefreshToken(refreshToken: string): Promise<string>;

  refreshTheToken(
    userId: string,
    refreshToken: string,
  ): Promise<{ refreshToken: string }>;

  invalidateRefreshToken(refreshToken: string): Promise<string>;

  // Password reset helpers
  generatePasswordResetToken(userId: string): Promise<string>;
  validatePasswordResetToken(token: string): Promise<string>;
  invalidatePasswordResetToken(token: string): Promise<void>;

  // Invalidate all refresh tokens for a user
  invalidateAllRefreshTokensForUser(userId: string): Promise<void>;
}
