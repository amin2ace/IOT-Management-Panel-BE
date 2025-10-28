import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { loginInputDto } from './dto/login-input.dto';
import { SignupInputDto } from './dto/signup-input.dto';
import { TokenType } from 'src/config/enum/token-type.enum';
import { TokenService } from './token.service';
import { CookieService } from './cookie.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { Response, Request } from 'express';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth-Module')
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly cookieService: CookieService,
  ) {}

  @Post('signup')
  async signup(@Body() signupData: SignupInputDto, @Res() res: Response) {
    const { accessToken, refreshToken } =
      await this.authService.signup(signupData);

    return res.send({
      accessToken,
      refreshToken: refreshToken.split('.')[0], // Split the refresh string from token
    });
  }

  @Post('login')
  async login(@Body() loginData: loginInputDto, @Res() res: Response) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginData);

    // console.log({ accessToken, refreshToken });
    await this.cookieService.setTokensCookie(
      res,
      TokenType.REFRESH,
      refreshToken,
    );

    return res.send({
      accessToken,
      refreshToken: refreshToken.split('.')[0],
    });
  }

  @Post('logout')
  @ApiCookieAuth() // Use cookie auth for refresh token
  @ApiBearerAuth('access-token') // Use bearer auth for access token
  async logout(@Req() req: Request, @Res() res: Response) {
    const { refreshToken } = await this.cookieService.getRefreshTokenFromCookie(
      req,
      TokenType.REFRESH,
    );
    const userId = req['userId'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const result = await this.authService.logout(refreshToken, req);
    res.clearCookie(TokenType.REFRESH);
    return res.send(result);
  }

  @Post('refresh')
  @ApiCookieAuth() // Use cookie auth for refresh token
  @ApiBearerAuth('access-token') // Use bearer auth for access token
  async refreshTheToken(@Req() req: Request, @Res() res: Response) {
    const userId = req['userId'];
    const { refreshToken } = await this.cookieService.getRefreshTokenFromCookie(
      req,
      TokenType.REFRESH,
    );
    // console.log({ refreshToken });
    const response = await this.tokenService.refreshTheToken(
      userId,
      refreshToken,
    );

    return res.send(response);
  }

  @ApiBearerAuth('access-token') // Use bearer auth for access token
  @Post('change-password')
  async changePassword(
    @Req() req: Request,
    @Body() changePasswordData: ChangePasswordDto,
    @Res() res: Response,
  ) {
    await this.authService.changePassword(req, changePasswordData);

    return res.send({ message: 'Password Changed Successfully' });
  }

  @Post('forget-password')
  async forgetPassword(@Body() forgetDto: ForgetPasswordDto) {
    const result = await this.authService.requestPasswordReset(forgetDto);
    // In production you'd email this token; returning it here for testing
    return { message: 'Reset token generated', resetToken: result.resetToken };
  }

  @Post('reset-password')
  async resetPassword(@Body() resetDto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(resetDto);
    return { message: result };
  }
}
