import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SignupInputDto } from './dto/signup-input.dto';
import { loginInputDto } from './dto/login-input.dto';
import { IAuthService } from './interface/auth-service.interface';
import { HashService } from './hash.service';
import { TokenService } from './token.service';
import { TokenType } from 'src/config/enum/token-type.enum';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Request } from 'express';
import { UsersService } from 'src/users/users.service';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
  ) {}

  async signup(
    createUserData: SignupInputDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, userName, password } = createUserData;

    const user = await this.usersService.findUserByEmail(email);

    if (user) {
      throw new UnauthorizedException('Email in use');
    }

    // Hash the password only
    const { password: hashedPassword } = await this.hashService.hash({
      password,
    });

    if (!hashedPassword) {
      throw new UnauthorizedException('Hash Error');
    }

    const userData = {
      email,
      password: hashedPassword,
      userName,
    };
    const createdUser = await this.usersService.createUser(userData);

    // Generate access and refresh tokens for the user
    const { accessToken, refreshToken } = await this.createUserTokens(
      createdUser.userId, // userId
    );

    // Return the generated tokens
    return { accessToken, refreshToken };
  }

  async login(
    loginData: loginInputDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = loginData;

    // Find the user by email
    const user = await this.usersService.findUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await this.hashService.compareHash(
      user.password,
      password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate access and refresh tokens for the user
    const { accessToken, refreshToken } = await this.createUserTokens(
      user.userId,
    );

    // Return the generated tokens
    return { accessToken, refreshToken };
  }

  async logout(refreshToken: string, req: Request): Promise<string> {
    // Extract access token from request header
    const accessToken = req.headers.authorization?.split(' ')[1];
    // Invalidate the provided refresh token
    await this.tokenService.invalidateRefreshToken(refreshToken);

    // Create a new blacklist record with the access token
    if (!accessToken) {
      throw new UnauthorizedException('No Access Token');
    }
    await this.tokenService.storeAccessTokenInBlacklist(accessToken);

    // Return a success message
    return `User Logged Out`;
  }

  async changePassword(
    req: Request,
    changePasswordData: ChangePasswordDto,
  ): Promise<string> {
    const { oldPassword, newPassword, retypePassword } = changePasswordData;

    // Extract User Id
    const userId = req['userId'];

    // Extract Access Token
    const accessToken = req.headers.authorization?.split(' ')[1];

    // Check if a user with the provided email exists
    const user = await this.usersService.findUserById(userId);

    // Compare the old password with the stored password
    const isOldPasswordValid = await this.hashService.compareHash(
      user.password,
      oldPassword,
    );

    // If old password does not match, throw a ForbiddenException
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Incorrect Password');
    }

    // Compare new password and the retype password
    if (newPassword !== retypePassword) {
      throw new UnauthorizedException('Passwords do not match');
    }

    // Hash the new password
    const { password: hashedPassword } = await this.hashService.hash({
      password: newPassword,
    });

    if (!hashedPassword) {
      throw new UnauthorizedException('Hash Error');
    }
    // Save the updated user record to the database
    await this.usersService.updateUser(userId, {
      password: hashedPassword,
    });

    if (!accessToken) {
      throw new UnauthorizedException('No Access Token');
    }
    // Invalidate the Access Token
    await this.tokenService.storeAccessTokenInBlacklist(accessToken);

    // Invalidate Refresh Token

    await this.tokenService.invalidateRefreshToken(
      req.cookies['refresh-token'],
    );

    // Return a success message
    return `Password Changed`;
  }

  async requestPasswordReset(
    forgetDto: ForgetPasswordDto,
  ): Promise<{ resetToken: string }> {
    const { email } = forgetDto;
    const user = await this.usersService.findUserByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate a password reset token and persist it
    const token = await this.tokenService.generatePasswordResetToken(
      user.userId,
    );

    // TODO: Send token to user's email via an email provider
    // For now return the token directly for testing purposes
    return { resetToken: token };
  }

  async resetPassword(resetDto: ResetPasswordDto): Promise<string> {
    const { token, newPassword, retypePassword } = resetDto;

    if (newPassword !== retypePassword) {
      throw new UnauthorizedException('Passwords do not match');
    }

    // Validate reset token and get userId
    const userId = await this.tokenService.validatePasswordResetToken(token);

    // Hash the new password
    const { password: hashedPassword } = await this.hashService.hash({
      password: newPassword,
    });

    // Update user's password
    await this.usersService.updateUser(userId, { password: hashedPassword });

    // Invalidate the reset token so it cannot be reused
    await this.tokenService.invalidatePasswordResetToken(token);

    // Invalidate all refresh tokens for the user (require re-login)
    await this.tokenService.invalidateAllRefreshTokensForUser(userId);

    return `Password Reset Successful`;
  }

  async createUserTokens(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Generate an access token for the user
    const accessToken = await this.tokenService.generateAccessToken(
      userId,
      TokenType.ACCESS,
    );

    // Generate a refresh token for the user
    const refreshToken = await this.tokenService.generateRefreshToken(
      userId,
      TokenType.REFRESH,
    );
    // Return the generated tokens
    return {
      ...accessToken,
      ...refreshToken,
    };
  }
}
