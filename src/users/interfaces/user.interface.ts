import { User } from '@prisma/client';
import { Request } from 'express';

export interface JwtUser {
  sub: number;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user: JwtUser;
}

export interface CreateUser {
  username: string;
  password: string;
}

export interface UserWithOptionalPassword extends Omit<User, 'password'> {
  password?: string;
}
