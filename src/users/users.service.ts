import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from '@prisma/client';
import { JwtUser, UserWithOptionalPassword } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

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

  async updateUser(id: number, updateUserDto: Partial<User>): Promise<User> {
    return this.usersRepository.updateUser(id, updateUserDto);
  }
}
