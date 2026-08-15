import {
  Injectable,
  UnauthorizedException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { UsersService } from 'src/users/users.service';
import { Role } from 'src/config/types/roles.types';
import { v4 as uuidv4 } from 'uuid';
import { EncryptService } from '@/encrypt/encrypt.service';
import { CreateSessionDto } from '@/session/dto/create-session.dto';
import { CookieService } from './cookie.service';
import { SessionService } from '@/session/session.service';
import {
  ChangePasswordDto,
  ForgetPasswordDto,
  loginDto,
  ResetPasswordDto,
  SignupDto,
} from './dto';
import { AppException } from '@/common/errors/app.exception';
import { EXCEPTIONS } from '@/common/errors/exceptions';
import { User } from '@/users/entities/user.entity';

/**
 * AuthService - Hybrid authentication service
 *
 * Supports:
 * - Offline mode: Session-based authentication with Redis
 * - Future online mode: JWT-based authentication (ready for implementation)
 *
 * Features:
 * - User registration with email validation
 * - Secure login with password hashing
 * - Session management
 * - Password change with session invalidation
 * - Password reset flow
 * - Role-based access control
 * - Logout with session cleanup
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly usersService: UsersService,
    private readonly encryptService: EncryptService,
    private readonly sessionService: SessionService,
    private readonly cookieService: CookieService,
    private readonly config: ConfigService,
  ) {}

  /**
   * User Signup
   *
   * Flow:
   * 1. Validate input
   * 2. Check if email already exists
   * 3. Hash password
   * 4. Create user in database with default role (VIEWER)
   * 5. Create session in Redis
   * 6. Set secure httpOnly cookie
   * 7. Return user info (NO tokens)
   * @param signupData
   * @param req
   * @param res
   * @returns
   */
  async signup(
    signupData: SignupDto,
    req: Request,
    res: Response,
  ): Promise<User> {
    const { email, username, password } = signupData;

    // Validate input
    if (!email || !username || !password) {
      throw new AppException(
        EXCEPTIONS.INVALID_REQUEST,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Check if email already exists
    const existingUser = await this.usersService.findUserByEmail(email);
    if (existingUser) {
      throw new AppException(
        EXCEPTIONS.EMAIL_ALREADY_EXISTS,
        HttpStatus.CONFLICT,
      );
    }

    // Hash password
    const { password: hashedPassword } = await this.encryptService.hash({
      password,
    });

    if (!hashedPassword) {
      throw new AppException(
        EXCEPTIONS.INVALID_CREDENTIALS,
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Assign default role (VIEWER)
    const defaultRoles: Role[] = [Role.VIEWER];

    const createdUser = await this.usersService.createUser({
      email,
      password: hashedPassword,
      username,
      roles: defaultRoles,
    });

    // Create Session and set cookie
    await this.createSession(createdUser, req, res);

    return createdUser;
  }

  /**
   * User Login
   *
   * Flow:
   * 1. Validate credentials
   * 2. Find user by email
   * 3. Compare password hash
   * 4. Fetch user roles from database
   * 5. Create session in Redis
   * 6. Set secure httpOnly cookie
   * 7. Return user info + roles (NO tokens)
   */
  async login(loginData: loginDto, req: Request, res: Response): Promise<User> {
    const { email, password } = loginData;

    // Find user by email
    const user = await this.usersService.findUserByEmail(email);

    if (!user) {
      throw new AppException(
        EXCEPTIONS.INVALID_CREDENTIALS,
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Compare password
    const isPasswordValid = await this.encryptService.compareHash(
      user.password,
      password,
    );

    if (!isPasswordValid) {
      throw new AppException(
        EXCEPTIONS.INVALID_CREDENTIALS,
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Create Session and set cookie
    await this.createSession(user, req, res);

    return user;
  }

  /**
   * User Logout
   *
   * Flow:
   * 1. Destroy session in Redis
   * 2. Clear httpOnly cookie
   * 3. Return success message
   */
  async logout(req: Request, res: Response): Promise<{ message: string }> {
    const sessionId = (req as any).sessionId;
    const userId = (req as any).user?.userId;
    console.log(sessionId, userId);

    if (!sessionId) {
      throw new UnauthorizedException('Session not found');
    }

    // Destroy session
    await this.sessionService.destroySession(sessionId);

    // Clear cookie
    await this.cookieService.clearSessionCookie(res);

    this.logger.log(`User logged out: ${userId}`);

    return { message: 'Logged out successfully' };
  }

  /**
   * Change Password
   *
   * Flow:
   * 1. Get user ID from request
   * 2. Find user by ID
   * 3. Verify old password
   * 4. Validate new passwords match
   * 5. Hash new password
   * 6. Update password in database
   * 7. Invalidate all sessions (force re-login)
   * 8. Return success
   *
   * Security: Invalidating all sessions ensures the password change is secure
   */
  async changePassword(
    req: Request,
    changePasswordData: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { oldPassword, newPassword, retypePassword } = changePasswordData;

    if (newPassword !== retypePassword) {
      throw new AppException(
        EXCEPTIONS.PASSWORDS_DO_NOT_MATCH,
        HttpStatus.BAD_REQUEST,
      );
    }

    const userId = (req as any).user?.userId;

    if (!userId) {
      throw new AppException(EXCEPTIONS.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Find user
    const user = await this.usersService.findUserById(userId);

    if (!user) {
      throw new AppException(EXCEPTIONS.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Verify old password
    const isOldPasswordValid = await this.encryptService.compareHash(
      user.password,
      oldPassword,
    );

    if (!isOldPasswordValid) {
      throw new AppException(
        EXCEPTIONS.INVALID_CREDENTIALS,
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Hash new password
    const { password: hashedPassword } = await this.encryptService.hash({
      password: newPassword,
    });

    if (!hashedPassword) {
      throw new AppException(
        EXCEPTIONS.ENCRYPTION_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Update password
    await this.usersService.updateUser(userId, {
      password: hashedPassword,
    });

    // Invalidate all sessions for this user (force re-login)
    await this.sessionService.invalidateUserSessions(userId);

    this.logger.log(`Password changed for user: ${userId}`);

    return { message: 'Password changed successfully. Please login again.' };
  }

  /**
   * Request Password Reset
   *
   * Flow:
   * 1. Find user by email
   * 2. Generate reset token (will be stored in database)
   * 3. Return reset token
   *
   * TODO: Send reset token via email instead of returning it
   */
  async requestPasswordReset(
    forgetDto: ForgetPasswordDto,
  ): Promise<{ resetToken: string }> {
    const { email } = forgetDto;

    // Find user
    const user = await this.usersService.findUserByEmail(email);

    if (!user) {
      // Don't reveal if email exists (security best practice)
      // But for now, throw for clarity
      throw new AppException(EXCEPTIONS.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Generate reset token
    const resetToken = uuidv4();

    // TODO: Store reset token in database with expiry (15 minutes)
    // For now, just return it
    // In production, send via email

    this.logger.log(
      `Password reset requested for user: ${user.userId} (${email})`,
    );

    return { resetToken };
  }

  /**
   * Reset Password
   *
   * Flow:
   * 1. Validate reset token exists in database and not expired
   * 2. Validate new passwords match
   * 3. Hash new password
   * 4. Update password in database
   * 5. Invalidate reset token
   * 6. Invalidate all sessions (force re-login)
   * 7. Return success
   */
  async resetPassword(
    resetDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, newPassword, retypePassword } = resetDto;

    if (!token) {
      throw new AppException(
        EXCEPTIONS.INVALID_REQUEST,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate new passwords match
    if (newPassword !== retypePassword) {
      throw new AppException(
        EXCEPTIONS.PASSWORDS_DO_NOT_MATCH,
        HttpStatus.BAD_REQUEST,
      );
    }

    // TODO: Validate token exists in database and not expired
    // For now, assume token is valid (use a placeholder userId)
    const userId = 'user-id-from-token'; // In production, extract from DB

    // TODO: Remove this after implementing token validation
    if (userId === 'user-id-from-token') {
      throw new AppException(
        EXCEPTIONS.INVALID_REQUEST,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Find user
    const user = await this.usersService.findUserById(userId);

    if (!user) {
      throw new AppException(EXCEPTIONS.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    // Hash new password
    const { password: hashedPassword } = await this.encryptService.hash({
      password: newPassword,
    });

    if (!hashedPassword) {
      throw new AppException(
        EXCEPTIONS.ENCRYPTION_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Update password
    await this.usersService.updateUser(userId, {
      password: hashedPassword,
    });

    // TODO: Delete reset token from database
    // Invalidate all sessions for this user (force re-login)
    await this.sessionService.invalidateUserSessions(userId);

    this.logger.log(`Password reset for user: ${userId}`);

    return {
      message:
        'Password reset successfully. Please login with your new password.',
    };
  }

  /**
   * Extract client IP address from request
   * Handles proxies and load balancers
   */
  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.socket.remoteAddress || 'unknown';
  }

  /**
   * Extract client user agent from request
   */
  private getClientUserAgent(req: Request): string {
    return req.headers['user-agent'] || 'unknown';
  }

  private async createSession(user: User, req: Request, res: Response) {
    const { userId, username, roles } = user;
    const sessionData: CreateSessionDto = {
      userId,
      username,
      roles,
      ipAddress: this.getClientIp(req),
      userAgent: this.getClientUserAgent(req),
    };
    // Create session
    const sessionId = await this.sessionService.createSession(sessionData);

    // Set secure httpOnly cookie
    return this.cookieService.setSessionCookie(res, sessionId);
  }
}
