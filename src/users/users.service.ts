import {
  Injectable,
  // ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// import { CreateUserDto, UpdateUserDto } from './dto';
// import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findUser({ username, user }: { username: string; user?: any }) {
    console.log('----------findUser-------', username);
    return await this.prisma.user.findUnique({
      where: {
        ...(user?.sub ? { id: user?.sub } : undefined),
        username,
      },
    });
  }

  async findById({ id }: { id: number }) {
    console.log('----------findById-------', id);
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateUser({ id, username }: { id: number; username: string }) {
    // -- TODO fix type
    console.log('----------update-------', id, username);
    return await this.prisma.user.update({
      where: { id },
      data: { username },
    });
  }
}
