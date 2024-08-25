import { User, RefreshToken } from '@prisma/client';
import { Request } from 'express';

export interface JwtUser {
  sub: number;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user: JwtUser;
}

export interface RefreshTokenWithUser extends RefreshToken {
  user: User;
}

export interface UserWithOptionalPassword extends Omit<User, 'password'> {
  password?: string;
}

export interface SignUpUserResponse {
  accessToken: string;
  refreshToken?: string;
  user: UserWithOptionalPassword;
}
