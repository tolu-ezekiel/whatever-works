import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';
import { CreateUser } from './interfaces/user.interface';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async createUser(data: CreateUser): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findUser(criteria: Partial<User>): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: criteria,
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
