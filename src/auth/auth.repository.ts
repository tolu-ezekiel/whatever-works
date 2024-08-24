import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RefreshTokenWithUser } from './interfaces/auth.interface';

@Injectable()
export class AuthRepository {
  constructor(private prisma: PrismaService) {}

  async findRefreshTokenDetails(
    userId: number,
    refreshToken: string,
  ): Promise<RefreshTokenWithUser | null> {
    return this.prisma.refreshToken.findUnique({
      include: { user: true },
      where: {
        user_id: userId,
        value: refreshToken,
        expiration_date: { gt: new Date() },
      },
    });
  }

  async upsertRefreshToken(
    userId: number,
    refreshToken: string,
    expirationDate: Date,
  ): Promise<void> {
    await this.prisma.refreshToken.upsert({
      where: { user_id: userId },
      create: {
        user_id: userId,
        value: refreshToken,
        expiration_date: expirationDate,
      },
      update: { value: refreshToken, expiration_date: expirationDate },
    });
  }

  async removeUserRefreshToken(userId: number): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { user_id: userId },
      data: {
        value: '',
        expiration_date: new Date(),
      },
    });
  }
}
