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

  async updateUser(id: number, updateUserDto: any) {
    // -- TODO fix type
    console.log('----------update-------', id, updateUserDto);
    return await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async findById(id: number) {
    console.log('----------findById-------', id);
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByUsername(username: string) {
    console.log('----------findByUsername-------', username);
    return await this.prisma.user.findUnique({ where: { username } });
  }
}
