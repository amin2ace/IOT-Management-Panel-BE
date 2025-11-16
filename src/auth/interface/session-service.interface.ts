import { Role } from 'src/config/types/roles.types';

/**
 * Session Data stored in Redis
 * Contains all user information needed for requests
 */
export interface ISessionData {
  userId: string;
  userName: string;
  roles: Role[];
  loginTime: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
}

/**
 * Session Service Interface
 * Handles creation, validation, and destruction of sessions
 */
export interface ISessionService {
  /**
   * Create a new session in Redis
   * @param userId - User ID
   * @param userName - User name
   * @param email - User email
   * @param roles - User roles
   * @param ipAddress - Client IP address
   * @param userAgent - Client user agent
   * @returns Session ID
   */
  createSession(
    userId: string,
    userName: string,
    roles: Role[],
    ipAddress: string,
    userAgent: string,
  ): Promise<string>;

  /**
   * Get session data from Redis
   * @param sessionId - Session ID
   * @returns Session data or null if not found
   */
  getSession(sessionId: string): Promise<ISessionData | null>;

  /**
   * Validate session exists and is not expired
   * @param sessionId - Session ID
   * @returns true if valid, false otherwise
   */
  validateSession(sessionId: string): Promise<boolean>;

  /**
   * Destroy a session (logout)
   * @param sessionId - Session ID
   */
  destroySession(sessionId: string): Promise<void>;

  /**
   * Extend session TTL (refresh activity)
   * @param sessionId - Session ID
   * @returns Updated session data
   */
  extendSession(sessionId: string): Promise<ISessionData | null>;

  /**
   * Invalidate all sessions for a user
   * Used when password changes
   * @param userId - User ID
   */
  invalidateUserSessions(userId: string): Promise<void>;
}
