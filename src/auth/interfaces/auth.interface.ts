import { User, RefreshToken } from '@prisma/client';
import { Request } from 'express';

interface JwtUser {
  sub: number;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user: JwtUser;
}

export interface RefreshTokenWithUser extends RefreshToken {
  user: User;
}
