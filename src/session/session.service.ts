import {
  Injectable,
  Logger,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ISessionService,
  ISessionData,
} from './interface/session-service.interface';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from '@/redis/redis.service';
import { plainToInstance } from 'class-transformer';
import { SessionCache } from '@/redis/dto/session.cache.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { AppException } from '@/common/errors/app.exception';
import { EXCEPTIONS } from '@/common/errors/exceptions';

/**
 * SessionService - Manages user sessions in Redis for offline/local authentication
 *
 * Features:
 * - Creates sessions with user data and roles
 * - Validates sessions exist and are not expired
 * - Extends session TTL on activity (automatic refresh)
 * - Destroys sessions on logout
 * - Invalidates all sessions when password changes
 *
 * Redis Key Format:
 * - session:{sessionId} → ISessionData (TTL: 24h)
 * - user:sessions:{userId}:{sessionId} → boolean (TTL: 24h) [for tracking]
 */
@Injectable()
export class SessionService implements ISessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly sessionTimeout: number; // seconds
  private readonly refreshInterval: number; // seconds
  private readonly ttl: number; // seconds

  constructor(
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
  ) {
    // Session timeout from config (default 24 hours) in seconds
    this.sessionTimeout =
      this.configService.getOrThrow<number>('SESSION_TIMEOUT') / 1000;
    // Refresh interval for lastActivity (default 5 minutes)
    this.refreshInterval = this.configService.getOrThrow<number>(
      'SESSION_REFRESH_INTERVAL',
    );
    // Cache TTL in seconds
    this.ttl = this.configService.getOrThrow<number>('REDIS_TTL');
  }

  /**
   * Create a new session for authenticated user
   */
  async createSession(data: CreateSessionDto): Promise<string> {
    try {
      const sessionId = uuidv4();
      const timestamp = new Date();

      const sessionData: ISessionData = {
        ...data,
        loginTime: timestamp,
        lastActivity: timestamp,
      };
      // Store session in Redis with TTL
      const ttlSeconds = this.sessionTimeout;
      await this.redis.setex(
        `session:${sessionId}`,
        JSON.stringify(sessionData),
        ttlSeconds,
      );

      // Track session ID under user for invalidation purposes
      await this.redis.setex(
        `user:sessions:${sessionData.userId}:${sessionId}`,
        'true',
        ttlSeconds,
      );
      return sessionId;
    } catch (error) {
      throw new AppException(
        EXCEPTIONS.SESSION_ESTABLISH_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTrackSession(
    sessionId: string,
    userId: string,
  ): Promise<ISessionData> {
    const data = await this.redis.get(`user:sessions:${userId}:${sessionId}`);

    if (!data) {
      this.logger.warn(`Session for user ${userId} not found`);
      throw new NotFoundException(`Session for user ${userId} not found`);
    }
    const sessinoData = plainToInstance(SessionCache, data, {
      excludeExtraneousValues: true,
    });

    return sessinoData;
  }

  /**
   * Retrieve session data from Redis
   */
  async getSession(sessionId: string): Promise<ISessionData | null> {
    try {
      const data = await this.redis.get(`session:${sessionId}`);

      if (!data) {
        this.logger.warn(`Session not found: ${sessionId}`);
        return null;
      }

      // Handle both object and string formats
      const sessionData = typeof data === 'string' ? JSON.parse(data) : data;
      return sessionData as ISessionData;
    } catch (error) {
      throw new AppException(
        EXCEPTIONS.SESSION_RETRIEVE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      return null;
    }
  }

  /**
   * Validate that session exists and is not expired
   */
  async validateSession(sessionId: string): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);
      return session !== null;
    } catch (error) {
      throw new AppException(
        EXCEPTIONS.SESSION_VALIDATION_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Destroy a session (used on logout)
   */
  async destroySession(sessionId: string): Promise<void> {
    try {
      // Get session data before deletion (to access userId)
      const session = await this.getSession(sessionId);

      if (session) {
        // Delete main session key
        await this.redis.del(`session:${sessionId}`);

        // Delete tracking key
        await this.redis.del(`user:sessions:${session.userId}:${sessionId}`);

        this.logger.log(`Session destroyed: ${sessionId}`);
      }
    } catch (error) {
      throw new AppException(
        EXCEPTIONS.SESSION_DESTROY_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Extend session TTL and update lastActivity
   * Called on each authenticated request to keep session alive
   */
  async extendSession(sessionId: string): Promise<ISessionData | null> {
    try {
      const sessionData = await this.getSession(sessionId);

      if (!sessionData) {
        return null;
      }

      // Update lastActivity
      sessionData.lastActivity = new Date();

      // Re-set with extended TTL
      const ttlSeconds = this.sessionTimeout;
      await this.redis.setex(
        `session:${sessionId}`,
        JSON.stringify(sessionData),
        ttlSeconds,
      );

      // Also extend tracking key
      await this.redis.setex(
        `user:sessions:${sessionData.userId}:${sessionId}`,
        'true',
        ttlSeconds,
      );

      this.logger.debug(`Session extended: ${sessionId}`);
      return sessionData;
    } catch (error) {
      throw new AppException(
        EXCEPTIONS.SESSION_EXTENSION_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Invalidate all sessions for a user
   * Used when password changes to force re-login on all devices
   */
  async invalidateUserSessions(userId: string): Promise<void> {
    try {
      // Scan for all session tracking keys for this user
      // Pattern: user:sessions:{userId}:*
      const pattern = `user:sessions:${userId}:*`;
      const cursor = '0';
      const scanResults = [];

      // Use SCAN to find all matching keys (non-blocking)
      let scanCursor = cursor;
      do {
        const [nextCursor, keys] = await this.redis.scan(
          scanCursor,
          'MATCH',
          pattern,
          'COUNT',
          100,
        );

        for (const key of keys) {
          // Extract sessionId from key: user:sessions:{userId}:{sessionId}
          const sessionId = key.split(':')[3];
          await this.redis.del(`session:${sessionId}`);
          await this.redis.del(key);
        }

        scanCursor = nextCursor;
      } while (scanCursor !== '0');

      this.logger.log(`All sessions invalidated for user: ${userId}`);
    } catch (error) {
      throw new AppException(
        EXCEPTIONS.SESSION_INVALIDATION_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
