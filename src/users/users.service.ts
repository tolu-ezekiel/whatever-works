import { Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { addMonths } from 'date-fns';
import { UsersRepository } from './users.repository';
import { AuthRepository } from '../auth/auth.repository';
import { User } from '@prisma/client';
import {
  JwtUser,
  UserWithOptionalPassword,
  UpdateUsernameResponse,
} from './interfaces/user.interface';
import { generateRefreshToken } from '../common/util/refresh-token.util';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
    private authRepository: AuthRepository,
  ) {}

  async findById(id: number): Promise<UserWithOptionalPassword> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      ...user,
      password: undefined,
    };
  }

  async findUser(
    getUserQueryDto: Partial<User>,
    requestUser?: JwtUser,
  ): Promise<UserWithOptionalPassword | null> {
    const criteria = {
      ...(requestUser?.sub ? { id: requestUser.sub } : undefined),
      ...getUserQueryDto,
    };

    const user = await this.usersRepository.findUser(criteria);
    if (!user) {
      return null;
    }
    return {
      ...user,
      password: undefined,
    };
  }

  async updateUsername(
    id: number,
    username: string,
  ): Promise<UpdateUsernameResponse> {
    const user = await this.usersRepository.updateUser(id, { username });

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
}
