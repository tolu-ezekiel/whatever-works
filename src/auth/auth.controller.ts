import {
  Body,
  Controller,
  // Get,
  HttpCode,
  HttpStatus,
  Post,
  // Request,
  // UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginUserDto: Record<string, any>) {
    // TODO fix types
    return this.authService.login(loginUserDto);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('signup')
  async signup(@Body() signUpUserDto: any): Promise<Record<string, any>> {
    // TODO fix types
    const { username, password } = signUpUserDto;
    return this.authService.signup({ username, password });
  }

  // logout

  // newAccessToken

  // changePassword

  // forgotPassword -- TODO --
}
