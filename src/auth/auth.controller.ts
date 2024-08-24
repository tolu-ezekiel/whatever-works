import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '../auth/auth.guard';
import {
  SignUpUserDto,
  loginUserDto,
  ResetPasswordDto,
  NewAccessTokenDto,
} from './dto';
import { AuthenticatedRequest } from './interfaces/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  async signup(
    @Body() signUpUserDto: SignUpUserDto,
  ): Promise<Record<string, any>> {
    // TODO fix types
    const { username, password } = signUpUserDto;
    return this.authService.signup({ username, password });
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginUserDto: loginUserDto) {
    // TODO fix types
    const { username, password } = loginUserDto;
    return this.authService.login({ username, password });
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @Request() req: AuthenticatedRequest,
  ): Promise<Record<string, any>> {
    // TODO fix types
    return this.authService.logout({ requestUser: req.user });
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Record<string, any>> {
    // TODO fix types
    const { oldPassword, newPassword } = resetPasswordDto;
    return this.authService.resetPassword({
      oldPassword,
      newPassword,
      requestUser: req.user,
    });
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('new-access-token')
  async newAccessToken(
    @Body() newAccessTokenDto: NewAccessTokenDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Record<string, any>> {
    // TODO fix types
    return this.authService.newAccessToken({
      refreshToken: newAccessTokenDto.refreshToken,
      requestUser: req.user,
    });
  }
}
