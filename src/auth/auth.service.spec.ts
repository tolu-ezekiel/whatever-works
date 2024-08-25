import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { RefreshToken, User } from '@prisma/client';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { UsersRepository } from '../users/users.repository';
import { generateRefreshToken } from '../common/util/refresh-token.util';

jest.mock('../common/util/refresh-token.util');
const mockGenerateRefreshToken = generateRefreshToken as jest.Mock;

const user: User = {
  id: 1,
  username: 'username',
  password: 'hashedPassword',
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
};

const refreshTokenDetails: RefreshToken = {
  id: 1,
  value: 'refreshTokenValue',
  user_id: user.id,
  expiration_date: new Date(),
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: new Date(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let authRepository: AuthRepository;
  let usersRepository: UsersRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: AuthRepository,
          useValue: {
            upsertRefreshToken: jest.fn(),
            removeUserRefreshToken: jest.fn(),
            findRefreshTokenDetails: jest.fn(),
          },
        },
        {
          provide: UsersRepository,
          useValue: {
            findUser: jest.fn(),
            createUser: jest.fn(),
            updateUser: jest.fn(),
            updateUsername: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    authRepository = module.get<AuthRepository>(AuthRepository);
    usersRepository = module.get<UsersRepository>(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should create a new user and return access and refresh tokens', async () => {
      const signUpUserDto = { username: 'username', password: 'password' };
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      jest.spyOn(bcrypt, 'hash' as any).mockResolvedValue('hashedPassword');
      usersRepository.createUser = jest.fn().mockResolvedValue(user);
      jwtService.signAsync = jest.fn().mockResolvedValue(accessToken);
      mockGenerateRefreshToken.mockResolvedValue(refreshToken);

      const result = await authService.signup(signUpUserDto);

      expect(usersRepository.createUser).toHaveBeenCalledWith({
        username: 'username',
        password: 'hashedPassword',
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        username: user.username,
        sub: user.id,
      });
      expect(result).toEqual({
        accessToken,
        refreshToken,
        user: {
          ...user,
          password: undefined,
        },
      });
    });

    it('should throw a ConflictException if username already exists', async () => {
      const signUpUserDto = { username: 'username', password: 'password' };

      usersRepository.createUser = jest.fn().mockRejectedValue(new Error());

      await expect(authService.signup(signUpUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('validateUser', () => {
    it('should validate the user and return user details without the password', async () => {
      const username = 'test';
      const password = 'password';

      usersRepository.findUser = jest.fn().mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare' as any).mockResolvedValue(true);

      const result = await authService.validateUser(username, password);

      expect(usersRepository.findUser).toHaveBeenCalledWith({ username });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(result).toEqual({
        ...user,
        password: undefined,
      });
    });

    it('should return null if user is not found or password is incorrect', async () => {
      const username = 'test';
      const password = 'password';

      usersRepository.findUser = jest.fn().mockResolvedValue(null);
      jest.spyOn(bcrypt, 'compare' as any).mockResolvedValue(false);

      const result = await authService.validateUser(username, password);

      expect(usersRepository.findUser).toHaveBeenCalledWith({ username });
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should log in the user and return access and refresh tokens', async () => {
      const loginUserDto = { username: 'username', password: 'password' };
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      jest
        .spyOn(authService, 'validateUser')
        .mockResolvedValue({ ...user, password: undefined } as any);
      jwtService.signAsync = jest.fn().mockResolvedValue(accessToken);
      mockGenerateRefreshToken.mockResolvedValue(refreshToken);

      const result = await authService.login(loginUserDto);

      expect(authService.validateUser).toHaveBeenCalledWith(
        loginUserDto.username,
        loginUserDto.password,
      );
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        username: user.username,
        sub: user.id,
      });
      expect(result).toEqual({
        accessToken,
        refreshToken,
        user: {
          ...user,
          password: undefined,
        },
      });
    });

    it('should throw an UnauthorizedException if credentials are invalid', async () => {
      const loginUserDto = { username: 'test', password: 'password' };

      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await expect(authService.login(loginUserDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should remove user refresh token and return a success message', async () => {
      const requestUser = { sub: 1, username: 'username' };

      authRepository.removeUserRefreshToken = jest
        .fn()
        .mockResolvedValue(undefined);

      const result = await authService.logout(requestUser);

      expect(authRepository.removeUserRefreshToken).toHaveBeenCalledWith(
        requestUser.sub,
      );
      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('resetPassword', () => {
    it('should reset the password successfully', async () => {
      const resetPasswordDto = {
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
      };
      const requestUser = { sub: 1, username: 'username' };
      const upDatedUserWithPassword = {
        ...user,
        password: 'newPasswordHash',
      };

      jest.spyOn(usersRepository, 'findUser').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare' as any).mockResolvedValue(true);
      jest.spyOn(bcrypt, 'hash' as any).mockResolvedValue('newPasswordHash');
      jest
        .spyOn(usersRepository, 'updateUser')
        .mockResolvedValue(upDatedUserWithPassword);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('newAccessToken');
      mockGenerateRefreshToken.mockResolvedValue('newRefreshToken');

      const result = await authService.resetPassword(
        resetPasswordDto,
        requestUser,
      );

      expect(result).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      });
    });

    it('should throw UnauthorizedException if old password is incorrect', async () => {
      const resetPasswordDto = {
        oldPassword: 'wrongPassword',
        newPassword: 'newPassword',
      };
      const requestUser = { sub: 1, username: 'username' };

      jest.spyOn(usersRepository, 'findUser').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare' as any).mockResolvedValue(false);

      await expect(
        authService.resetPassword(resetPasswordDto, requestUser),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('newAccessToken', () => {
    it('should generate a new access token successfully', async () => {
      const newAccessTokenDto = { refreshToken: 'validRefreshToken' };
      const requestUser = { sub: 1, username: 'username' };

      jest.spyOn(authRepository, 'findRefreshTokenDetails').mockResolvedValue({
        ...refreshTokenDetails,
        user,
      });
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue('newAccessToken');

      const result = await authService.newAccessToken(
        newAccessTokenDto,
        requestUser,
      );

      expect(result).toEqual({ accessToken: 'newAccessToken' });
    });

    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      const newAccessTokenDto = { refreshToken: 'invalidRefreshToken' };
      const requestUser = { sub: 1, username: 'username' };

      jest
        .spyOn(authRepository, 'findRefreshTokenDetails')
        .mockResolvedValue(null);

      await expect(
        authService.newAccessToken(newAccessTokenDto, requestUser),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
