import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService } from './redis.service';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Redis({
          host: config.getOrThrow<string>('REDIS_HOST'),
          port: config.getOrThrow<number>('REDIS_PORT'),
          db: config.getOrThrow<number>('REDIS_DB'),
        });
      },
    },
    {
      provide: 'REDIS_SUBSCRIBER',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // separate client for pub/sub
        return new Redis({
          host: config.getOrThrow<string>('REDIS_HOST'),
          port: config.getOrThrow<number>('REDIS_PORT'),
          db: config.getOrThrow<number>('REDIS_DB'),
        });
      },
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', 'REDIS_SUBSCRIBER', RedisService],
})
export class RedisModule {}
