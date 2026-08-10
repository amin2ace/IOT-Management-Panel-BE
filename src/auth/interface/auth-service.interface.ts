import { SignupDto } from '../dto/signup.dto';
import { loginDto } from '../dto/login.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { Request } from 'express';
import { ForgetPasswordDto } from '../dto/forget-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

export interface IAuthService {
  signup(
    createUserData: SignupDto,
  ): Promise<{ accessToken: string; refreshToken: string }>;

  login(
    loginData: loginDto,
  ): Promise<{ accessToken: string; refreshToken: string }>;

  logout(refreshToken: string, req: Request): Promise<string>;

  changePassword(
    req: Request,
    changePasswordData: ChangePasswordDto,
  ): Promise<string>;

  createUserTokens(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }>;

  // Request a password reset (sends token to user email)
  requestPasswordReset(
    forgetDto: ForgetPasswordDto,
  ): Promise<{ resetToken: string }>;

  // Perform password reset using the token provided to the user
  resetPassword(resetDto: ResetPasswordDto): Promise<string>;
}
