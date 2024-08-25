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
import { LoginUserDto } from './dto/login-user.dto';
import { SignUpUserDto } from './dto/signup-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { NewAccessTokenDto } from './dto/new-access-token.dto';
import { AuthenticatedRequest } from './interfaces/auth.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  async signup(
    @Body() signUpUserDto: SignUpUserDto,
  ): Promise<Record<string, any>> {
    return this.authService.signup(signUpUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() loginUserDto: LoginUserDto,
  ): Promise<Record<string, any>> {
    return this.authService.login(loginUserDto);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @Request() req: AuthenticatedRequest,
  ): Promise<Record<string, any>> {
    return this.authService.logout(req.user);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('reset-password')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Record<string, any>> {
    return this.authService.resetPassword(resetPasswordDto, req.user);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('new-access-token')
  async newAccessToken(
    @Body() newAccessTokenDto: NewAccessTokenDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<Record<string, any>> {
    return this.authService.newAccessToken(newAccessTokenDto, req.user);
  }
}
