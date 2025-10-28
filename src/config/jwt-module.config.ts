import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';

const jwtModuleOptions: JwtModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (configService: ConfigService): Promise<any> => {
    const secret = configService.get<string>('JWT_SECRET');
    const expiresIn = configService.get<string>('JWT_EXPIRES_IN');

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment');
    }
    if (!expiresIn) {
      throw new Error('JWT_EXPIRES_IN is not defined in environment');
    }

    return {
      secret,
      signOptions: {
        expiresIn,
      },
    };
  },
  global: true,
};

export default jwtModuleOptions;
