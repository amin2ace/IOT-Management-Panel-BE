import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenType } from 'src/config/enum/token-type.enum';
import { v4 as uuidv4 } from 'uuid';
import { Token } from './repository/token.entity';
import { Repository, Like } from 'typeorm';
import { ITokenService } from './interface/token-service.interface';
import { Blacklist } from './repository/blacklist.entity';

@Injectable()
export class TokenService implements ITokenService {
  constructor(
    @InjectRepository(Token) private tokenRepo: Repository<Token>,
    @InjectRepository(Blacklist) private blacklistRepo: Repository<Blacklist>,

    private readonly jwtservice: JwtService,
  ) {}

  async generateAccessToken(
    userId: string,
    type: TokenType,
  ): Promise<{ accessToken: string }> {
    const payload = { sub: userId, tokenType: type };
    const token = await this.jwtservice.sign(payload);

    return {
      accessToken: token,
    };
  }

  async generateRefreshToken(
    userId: string,
    type: TokenType,
  ): Promise<{ refreshToken: string }> {
    const uuid = uuidv4();
    const token = uuid + '.' + type;
    await this.storeRefreshToken(userId, token);
    return {
      refreshToken: token,
    };
  }

  async storeRefreshToken(userId: string, token: string) {
    // Only delete existing REFRESH tokens for this user to avoid removing other token types (e.g. reset tokens)
    await this.tokenRepo.delete({
      userId,
      token: Like(`%.${TokenType.REFRESH}`),
    });
    const tokenRecord = await this.tokenRepo.create({
      userId,
      token,
    });
    await this.tokenRepo.save(tokenRecord);
  }

  async storeAccessTokenInBlacklist(accessToken: string) {
    const blacklistRecord = this.blacklistRepo.create({
      token: accessToken,
    });

    // Save the blacklist record to the database
    await this.blacklistRepo.save(blacklistRecord);
  }

  async validateRefreshToken(refreshToken: string): Promise<string> {
    const token = await this.tokenRepo.findOne({
      where: { token: refreshToken },
    });
    if (!token) {
      throw new UnauthorizedException('Invalid Refresh Token');
    }
    return `Token Is Valid`; // Return a message if the token is valid
  }

  async refreshTheToken(
    userId: string,
    refreshToken: string,
  ): Promise<{ refreshToken: string }> {
    await this.validateRefreshToken(refreshToken + '.' + TokenType.REFRESH);
    const newToken = await this.generateRefreshToken(userId, TokenType.REFRESH);
    const token = await newToken.refreshToken.split('.')[0];
    return { refreshToken: token };
  }

  async invalidateRefreshToken(refreshToken: string) {
    try {
      // Expected input is the uuid part (cookie stores token.split('.')[0])
      await this.tokenRepo.delete({
        token: refreshToken + '.' + TokenType.REFRESH,
      });
      return `Record Deleted Successfully`;
    } catch (error) {
      throw new UnauthorizedException('Refresh Token Invalidate Failed');
    }
  }

  // --- Password reset token helpers ---
  async generatePasswordResetToken(userId: string): Promise<string> {
    const uuid = uuidv4();
    const token = uuid + '.reset';
    const tokenRecord = this.tokenRepo.create({
      userId,
      token,
    });
    await this.tokenRepo.save(tokenRecord);
    return uuid; // return the raw token part to be sent to user
  }

  async validatePasswordResetToken(token: string): Promise<string> {
    const record = await this.tokenRepo.findOne({
      where: { token: token + '.reset' },
    });
    if (!record) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }
    return record.userId;
  }

  async invalidatePasswordResetToken(token: string): Promise<void> {
    await this.tokenRepo.delete({ token: token + '.reset' });
  }

  async invalidateAllRefreshTokensForUser(userId: string): Promise<void> {
    // Delete all refresh tokens for the given user
    await this.tokenRepo.delete({
      userId,
      token: Like(`%.${TokenType.REFRESH}`),
    });
  }
}
