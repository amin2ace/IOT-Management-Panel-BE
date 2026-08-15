import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Serialize } from '@/common';
import { SessionAuthGuard } from '@/common/guard/session-auth.guard';
import {
  ChangePasswordDto,
  ForgetPasswordDto,
  loginDto,
  ResetPasswordDto,
  SignupDto,
  AuthResponseDto,
} from './dto';
import { ErrorResponseDto } from '@/common/errors/error-response.dto';

/**
 * AuthController - Handles all authentication-related endpoints
 *
 * Endpoints:
 * - POST /auth/signup: User registration (public)
 * - POST /auth/login: User login (public)
 * - POST /auth/logout: User logout (requires session)
 * - POST /auth/change-password: Change password (requires session)
 * - POST /auth/forget-password: Request password reset (public)
 * - POST /auth/reset-password: Reset password with token (public)
 *
 * Authentication:
 * - Uses SessionAuthGuard for session-based authentication
 * - Uses RolesGuard for role-based authorization
 * - Cookies are automatically handled (httpOnly)
 */
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * User Signup
   *
   * POST /auth/signup
   * Body: { email, userName, password }
   * Returns: { userId, userName, email, roles }
   * Sets: httpOnly sessionId cookie
   *
   * Status Codes:
   * - 201 Created: Signup successful
   * - 400 Bad Request: Invalid input
   * - 409 Conflict: Email already exists
   * @param signupData
   * @param req
   * @param res
   * @returns
   */
  @Post('signup')
  @Serialize(AuthResponseDto)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiOkResponse({
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request received',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Signup failed',
    type: ErrorResponseDto,
  })
  async signup(
    @Body() signupData: SignupDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.signup(signupData, req, res);
    return result;
  }

  /**
   * User Login
   *
   * POST /auth/login
   * Body: { email, password }
   * Returns: { userId, userName, email, roles }
   * Sets: httpOnly sessionId cookie
   *
   * Status Codes:
   * - 200 OK: Login successful
   * - 400 Bad Request: Invalid input
   * - 401 Unauthorized: Invalid credentials
   * @param loginData
   * @param req
   * @param res
   * @returns
   */
  @Post('login')
  @Serialize(AuthResponseDto)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiOkResponse({
    description: 'User logged in successfully',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request received',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
    type: ErrorResponseDto,
  })
  async login(
    @Body() loginData: loginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginData, req, res);
    return result;
  }

  /**
   * User Logout
   *
   * POST /auth/logout
   * Cookie: sessionId (required)
   * Returns: { message }
   *
   * Requires:
   * - Valid session (SessionAuthGuard)
   *
   * Status Codes:
   * - 200 OK: Logout successful
   * - 401 Unauthorized: Invalid session
   * @param req
   * @param res
   * @returns
   */
  @Post('logout')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Logout current user' })
  @ApiCookieAuth()
  @ApiOkResponse({
    description: 'Logout successful',
  })
  @ApiResponse({ status: 401, description: 'Invalid session' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.logout(req, res);
    return result;
  }

  /**
   * Change Password
   *
   * POST /auth/change-password
   * Body: { oldPassword, newPassword, retypePassword }
   * Returns: { message }
   *
   * Requires:
   * - Valid session (SessionAuthGuard)
   * - Any authenticated role (RolesGuard with implicit role check)
   *
   * Security:
   * - All sessions invalidated after password change (force re-login)
   * - Old password verified before allowing change
   * - New password hashed with bcrypt
   *
   * Status Codes:
   * - 200 OK: Password changed
   * - 401 Unauthorized: Invalid session or incorrect old password
   * - 400 Bad Request: Password mismatch
   * @param req
   * @param changePasswordData
   * @param res
   * @returns
   */
  @Post('change-password')
  @UseGuards(SessionAuthGuard)
  @ApiOperation({ summary: 'Change password for authenticated user' })
  @ApiCookieAuth()
  @ApiOkResponse({
    description: 'Password changed successfully',
    type: AuthResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request received',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid session or incorrect password',
    type: ErrorResponseDto,
  })
  async changePassword(
    @Req() req: Request,
    @Body() changePasswordData: ChangePasswordDto,
  ) {
    const result = await this.authService.changePassword(
      req,
      changePasswordData,
    );

    return result;
  }

  /**
   * Request Password Reset
   *
   * POST /auth/forget-password
   * Body: { email }
   * Returns: { resetToken }
   *
   * Security:
   * - Does not reveal if email exists (should implement in production)
   * - Reset token should be sent via email (not returned in response)
   *
   * Status Codes:
   * - 200 OK: Reset token generated
   * - 404 Not Found: Email not found (security: should return 200)
   * @param forgetDto
   * @returns
   */
  @Post('forget-password')
  @ApiOperation({ summary: 'Request password reset token' })
  @ApiOkResponse({
    description: 'Password reset token generated',
  })
  async forgetPassword(@Body() forgetDto: ForgetPasswordDto) {
    const result = await this.authService.requestPasswordReset(forgetDto);
    return result;
  }

  /**
   * Reset Password
   *
   * POST /auth/reset-password
   * Body: { token, newPassword, retypePassword }
   * Returns: { message }
   *
   * Security:
   * - Token must exist in database and not expired
   * - Token is single-use (invalidated after reset)
   * - All sessions invalidated after reset (force re-login)
   *
   * Status Codes:
   * - 200 OK: Password reset
   * - 401 Unauthorized: Invalid or expired token
   * - 400 Bad Request: Password mismatch
   * @param resetDto
   * @returns
   */
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with reset token' })
  @ApiOkResponse({
    description: 'Password reset successfully',
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(resetDto);
    return result;
  }
}
