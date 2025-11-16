import { Inject, Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis, { RedisKey } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name, { timestamp: true });

  constructor(
    @Inject('REDIS_CLIENT') private readonly client: Redis,
    @Inject('REDIS_SUBSCRIBER') private readonly subscriber: Redis,
  ) {}

  async get<T = any>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as any;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const payload = typeof value === 'string' ? value : JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.set(key, payload, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, payload);
    }
  }

  async setex(
    key: RedisKey,
    value: string | Buffer | number,
    ttlSeconds: number | string,
  ) {
    return await this.client.setex(key, ttlSeconds, value);
  }

  async scan(
    scanCursor: string,
    patternArg: 'MATCH',
    pattern: string,
    countArg: 'COUNT',
    count: number,
  ): Promise<[string, string[]]> {
    return await this.client.scan(
      scanCursor,
      patternArg,
      pattern,
      countArg,
      count,
    );
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  // set-if-not-exists with expiration (used for locks)
  async setIfNotExists(
    key: string,
    value: any,
    ttlMs: number,
  ): Promise<boolean> {
    const res = await this.client.set(
      key,
      JSON.stringify(value),
      'PX',
      ttlMs,
      'NX',
    );
    return res === 'OK';
  }

  // pub/sub
  async publish(channel: string, message: any) {
    const msg = typeof message === 'string' ? message : JSON.stringify(message);
    await this.client.publish(channel, msg);
  }

  // subscribe and register callback (returns unsubscribe function)
  subscribe(channel: string, callback: (message: string) => void) {
    const handler = (chan: string, message: string) => {
      if (chan === channel) callback(message);
    };

    this.subscriber.on('message', handler);
    this.subscriber.subscribe(channel);
    return async () => {
      this.subscriber.off('message', handler);
      await this.subscriber.unsubscribe(channel);
    };
  }

  onModuleDestroy() {
    try {
      this.client.quit();
      this.subscriber.quit();
    } catch (err) {
      this.logger.error('Error closing Redis clients', err);
    }
  }
}
