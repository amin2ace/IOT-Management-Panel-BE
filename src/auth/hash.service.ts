import { Injectable, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { IHashService } from './interface/hash-service.interface';
import { SignupInputDto } from './dto/signup-input.dto';
import { HashDto } from './dto/hash-data.dto';

@Injectable()
export class HashService implements IHashService {
  readonly salt: string;

  constructor(private readonly configService: ConfigService) {
    const rounds = this.configService.get<number>('ROUNDS');
    this.salt = bcrypt.genSaltSync(rounds);
  }

  async hash(dataToHash: Partial<HashDto>): Promise<Partial<HashDto>> {
    const result: Partial<HashDto> = {};

    try {
      const { email, password, userName } = dataToHash;

      if (email) {
        result.email = await bcrypt.hash(email, this.salt);
      }

      if (password) {
        result.password = await bcrypt.hash(password, this.salt);
      }

      if (userName) {
        result.userName = await bcrypt.hash(userName, this.salt);
      }

      return result;
    } catch (error) {
      throw new ConflictException('Hash Failed');
    }
  }

  // Specialized hash method for login - both fields required
  async hashLogin(dataToHash: { email: string; password: string }): Promise<{
    hashedEmail: string;
    hashedPassword: string;
  }> {
    try {
      const { email, password } = dataToHash;
      return {
        hashedEmail: await bcrypt.hash(email, this.salt),
        hashedPassword: await bcrypt.hash(password, this.salt),
      };
    } catch (error) {
      throw new ConflictException('Hash Failed');
    }
  }

  async hashEmail(email: string): Promise<{ hashedEmail: string }> {
    try {
      return { hashedEmail: await bcrypt.hash(email, this.salt) };
    } catch (error) {
      throw new ConflictException('Hash Failed');
    }
  }

  async compareHash(hashedData: string, plainText: string): Promise<boolean> {
    return bcrypt.compare(plainText, hashedData);
  }
}
