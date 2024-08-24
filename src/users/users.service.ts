import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { User } from '@prisma/client';
import { JwtUser } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async findUser(
    getUserQueryDto: Partial<User>,
    user?: JwtUser,
  ): Promise<User | null> {
    const criteria = {
      ...(user?.sub ? { id: user.sub } : undefined),
      ...getUserQueryDto,
    };
    return this.usersRepository.findUser(criteria);
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateUser(id: number, updateUserDto: Partial<User>): Promise<User> {
    return this.usersRepository.updateUser(id, updateUserDto);
  }
}
