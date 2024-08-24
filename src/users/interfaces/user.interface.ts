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
