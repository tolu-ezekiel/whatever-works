import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
// import { LoginUserDto } from '../users/dto/login-user.dto';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { addMonths } from 'date-fns';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async generateRefreshToken({
    byteLength = 100,
    userId,
  }: {
    byteLength?: number;
    userId: number;
  }) {
    try {
      const refreshToken: string = await new Promise((resolve, reject) => {
        crypto.randomBytes(byteLength, (err, buffer) => {
          if (err) {
            reject(err);
          } else {
            resolve(buffer.toString('hex'));
          }
        });
      });

      const expirationDate = addMonths(new Date(), 6);

      if (refreshToken) {
        await this.prisma.refreshToken.upsert({
          where: { user_id: userId },
          create: {
            user_id: userId,
            value: refreshToken,
            expiration_date: expirationDate,
          },
          update: {
            value: refreshToken,
            expiration_date: expirationDate,
          },
        });

        return refreshToken;
      }
    } catch (error) {
      console.log('unable to generate refresh token', error);
    }

    return undefined;
  }

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findUser({ username });
    if (user && (await bcrypt.compare(password, user.password))) {
      return {
        ...user,
        password: undefined,
      };
    }

    return null;
  }

  async signup(signUpUserDto: { username: any; password: any }) {
    // -- TODO fix type
    const { username, password } = signUpUserDto;
    console.log('-----username, password------', username, password);
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    try {
      user = await this.prisma.user.create({
        data: {
          username,
          password: hashedPassword,
        },
      });
    } catch (error: unknown) {
      console.error(error);
      throw new ConflictException('Username already exists');
    }

    const payload = { username: user.username, sub: user.id };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.generateRefreshToken({ userId: user.id });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async login(loginUserDto: any): Promise<{
    accessToken: string;
    refreshToken: string | undefined;
    user: any;
  }> {
    // TODO -- proper typing
    const user = await this.validateUser(
      loginUserDto.username,
      loginUserDto.password,
    );
    console.log('---user----', user);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user.id };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.generateRefreshToken({ userId: user.id });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async logout({ requestUser }: { requestUser: any }) {
    // -- TODO -- proper typing
    console.log('---logout--requestUser---', requestUser);
    await this.prisma.refreshToken.update({
      where: { user_id: requestUser.sub },
      data: {
        value: '',
        expiration_date: new Date(),
      },
    });
    return { message: 'Logged out successfully' };
  }

  async resetPassword({
    oldPassword,
    newPassword,
    requestUser,
  }: {
    oldPassword: string;
    newPassword: string;
    requestUser: any;
  }) {
    // TODO -- proper typing
    const user = await this.validateUser(requestUser.username, oldPassword);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    const payload = { username: user.username, sub: user.id };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.generateRefreshToken({ userId: user.id });

    return {
      // message: 'Password reset successfully',
      accessToken,
      refreshToken,
      user,
    };
  }

  async newAccessToken({
    refreshToken,
    requestUser,
  }: {
    refreshToken: string;
    requestUser: any;
  }) {
    // -- TODO -- proper typing
    console.log('------requestUser-----', requestUser);
    console.log('------refreshToken-----', refreshToken);
    const refreshTokenDetails = await this.prisma.refreshToken.findUnique({
      include: {
        user: true,
      },
      where: {
        user_id: requestUser.sub,
        value: refreshToken,
        expiration_date: { gt: new Date() },
      },
    });

    console.log('-------refreshTokenDetails----------', refreshTokenDetails);
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
