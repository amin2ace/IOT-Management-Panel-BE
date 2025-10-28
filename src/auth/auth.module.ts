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

@Module({
  imports: [
    TypeOrmModule.forFeature([Token, Blacklist]),
    UsersModule, // Add UsersModule import
  ],

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
