import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { addMonths } from 'date-fns';
import { User } from '@prisma/client';
import { AuthRepository } from './auth.repository';
import { UsersRepository } from '../users/users.repository';
import { SignUpUserDto } from './dto/signup-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { NewAccessTokenDto } from './dto/new-access-token.dto';
import {
  UserWithOptionalPassword,
  SignUpUserResponse,
  JwtUser,
  ResetPasswordResponse,
} from './interfaces/auth.interface';
import { generateRefreshToken } from '../common/util/refresh-token.util';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private authRepository: AuthRepository,
    private usersRepository: UsersRepository,
  ) {}

  async validateUser(
    username: string,
    password: string,
  ): Promise<UserWithOptionalPassword | null> {
    const user = await this.usersRepository.findUser({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      return {
        ...user,
        password: undefined,
      };
    }

    return null;
  }

  async signup(signUpUserDto: SignUpUserDto): Promise<SignUpUserResponse> {
    const { username, password } = signUpUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    let user: User;
    try {
      user = await this.usersRepository.createUser({
        username,
        password: hashedPassword,
      });
    } catch (error) {
      console.log(error);
      throw new ConflictException('Username already exists');
    }

    const payload = { username: user.username, sub: user.id };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await generateRefreshToken();

    if (refreshToken) {
      const expirationDate = addMonths(new Date(), 6);
      await this.authRepository.upsertRefreshToken(
        user.id,
        refreshToken,
        expirationDate,
      );
    }

    return {
      accessToken,
      refreshToken,
      user: {
        ...user,
        password: undefined,
      },
    };
  }

  async login(loginUserDto: any): Promise<SignUpUserResponse> {
    const user = await this.validateUser(
      loginUserDto.username,
      loginUserDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user.id };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await generateRefreshToken();

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async logout(requestUser: JwtUser): Promise<{ message: string }> {
    await this.authRepository.removeUserRefreshToken(requestUser.sub);
    return { message: 'Logged out successfully' };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    requestUser: JwtUser,
  ): Promise<ResetPasswordResponse> {
    const { oldPassword, newPassword } = resetPasswordDto;
    const user = await this.validateUser(requestUser.username, oldPassword);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.updateUser(user.id, {
      password: hashedNewPassword,
    });

    const payload = { username: user.username, sub: user.id };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await generateRefreshToken();
    if (refreshToken) {
      const expirationDate = addMonths(new Date(), 6);
      await this.authRepository.upsertRefreshToken(
        user.id,
        refreshToken,
        expirationDate,
      );
    }

    return {
      accessToken,
      refreshToken,
    };
  }

  async newAccessToken(
    newAccessTokenDto: NewAccessTokenDto,
    requestUser: JwtUser,
  ): Promise<{ accessToken: string }> {
    const { refreshToken } = newAccessTokenDto;
    const refreshTokenDetails =
      await this.authRepository.findRefreshTokenDetails(
        requestUser.sub,
        refreshToken,
      );

    if (!refreshTokenDetails?.user.id) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = {
      username: refreshTokenDetails.user.username,
      sub: refreshTokenDetails.user.id,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
    };
  }
}
