import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { TokenMiddleware } from './middleware/token.middleware';
import { Token } from './repository/token.entity';
import { Blacklist } from './repository/blacklist.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HashService } from './hash.service';
import { CookieService } from './cookie.service';
import { TokenService } from './token.service';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Token, Blacklist]),
    UsersModule, // Add UsersModule import
  ],
  controllers: [AuthController],
  providers: [AuthService, HashService, CookieService, TokenService],
  exports: [TypeOrmModule], // To use middleware in app module
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TokenMiddleware).forRoutes(
      {
        path: '/auth/logout',
        method: RequestMethod.POST,
      },
      {
        path: '/auth/refresh',
        method: RequestMethod.POST,
      },
      {
        path: '/auth/change-password',
        method: RequestMethod.POST,
      },
    );
  }
}
