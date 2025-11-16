import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { Token } from './repository/token.entity';
import { Blacklist } from './repository/blacklist.entity';
import { CookieService } from './cookie.service';
import { TokenService } from './token.service';
import { SessionService } from './session.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RedisModule } from '@/redis/redis.module';
import { HashModule } from '@/hash/hash.module';

/**
 * AuthModule - Provides authentication services
 *
 * Features:
 * - Session-based authentication (offline mode)
 * - JWT-based authentication (for future online mode)
 * - User registration and login
 * - Password management
 * - Role-based access control (via RolesGuard)
 * - Secure cookie handling
 *
 * Exports:
 * - AuthService: Main authentication service
 * - SessionService: Session management
 * - HashService: Password hashing
 * - SessionAuthGuard: Session validation guard
 * - RolesGuard: Role validation guard
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Token, Blacklist]),
    UsersModule,
    RedisModule,
    HashModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, CookieService, TokenService, SessionService],
  exports: [AuthService, SessionService, TokenService, CookieService],
})
export class AuthModule {
  // private readonly routes: RouteInfo[] = [
  //   {
  //     method: RequestMethod.POST,
  //     path: 'auth/logout',
  //   },
  //   {
  //     path: '/auth/refresh',
  //     method: RequestMethod.POST,
  //   },
  //   {
  //     path: '/auth/change-password',
  //     method: RequestMethod.POST,
  //   },
  // ];
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(SessionMiddleware).forRoutes();
  // }
  // Implementation for online JWT authentication
  // configure(consumer: MiddlewareConsumer) {
  //   // Keep original JWT middleware for backward compatibility
  //   consumer.apply(TokenMiddleware).forRoutes(
  //     {
  //       path: '/auth/logout',
  //       method: RequestMethod.POST,
  //     },
  //     {
  //       path: '/auth/refresh',
  //       method: RequestMethod.POST,
  //     },
  //     {
  //       path: '/auth/change-password',
  //       method: RequestMethod.POST,
  //     },
  //   );
  // }
}
