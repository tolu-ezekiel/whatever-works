import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { AuthGuard } from '../auth/auth.guard';
import { LoginUserDto } from './dto/login-user.dto';
import { SignUpUserDto } from './dto/signup-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { NewAccessTokenDto } from './dto/new-access-token.dto';
import { AuthenticatedRequest } from './interfaces/auth.interface';

const user: User = {
  id: 1,
  username: 'username',
  password: '1234',
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
};
const signUpUserDto: SignUpUserDto = {
  username: 'testuser',
  password: 'testpass',
};
const loginUserDto: LoginUserDto = {
  username: 'testuser',
  password: 'testpass',
};

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthGuard,
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(),
            login: jest.fn(),
            logout: jest.fn(),
            resetPassword: jest.fn(),
            newAccessToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should call AuthService.signup and return the result', async () => {
      const result = {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        user: {
          ...user,
          password: undefined,
        },
      };

      jest.spyOn(authService, 'signup').mockResolvedValue(result);

      expect(await authController.signup(signUpUserDto)).toBe(result);
      expect(authService.signup).toHaveBeenCalledWith(signUpUserDto);
    });
  });

  describe('login', () => {
    it('should call AuthService.login and return the result', async () => {
      const result = {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        user: {
          ...user,
          password: undefined,
        },
      };

      jest.spyOn(authService, 'login').mockResolvedValue(result);

      expect(await authController.login(loginUserDto)).toBe(result);
      expect(authService.login).toHaveBeenCalledWith(loginUserDto);
    });
  });

  describe('logout', () => {
    it('should call AuthService.logout and return the result', async () => {
      const req: Partial<AuthenticatedRequest> = {
        user: { sub: 1, username: 'testuser' },
      };
      const result = { message: 'Logged out successfully' };

      jest.spyOn(authService, 'logout').mockResolvedValue(result);

      expect(await authController.logout(req as AuthenticatedRequest)).toBe(
        result,
      );
      expect(authService.logout).toHaveBeenCalledWith(req.user);
    });
  });

  describe('resetPassword', () => {
    it('should call AuthService.resetPassword and return the result', async () => {
      const resetPasswordDto: ResetPasswordDto = {
        oldPassword: 'oldpass',
        newPassword: 'newpass',
      };
      const req: Partial<AuthenticatedRequest> = {
        user: { sub: 1, username: 'testuser' },
      };
      const result = {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
      };

      jest.spyOn(authService, 'resetPassword').mockResolvedValue(result);

      expect(
        await authController.resetPassword(
          resetPasswordDto,
          req as AuthenticatedRequest,
        ),
      ).toBe(result);
      expect(authService.resetPassword).toHaveBeenCalledWith(
        resetPasswordDto,
        req.user,
      );
    });
  });

  describe('newAccessToken', () => {
    it('should call AuthService.newAccessToken and return the result', async () => {
      const newAccessTokenDto: NewAccessTokenDto = {
        refreshToken: 'refresh-token',
      };
      const req: Partial<AuthenticatedRequest> = {
        user: { sub: 1, username: 'testuser' },
      };
      const result = { accessToken: 'new-access-token' };

      jest.spyOn(authService, 'newAccessToken').mockResolvedValue(result);

      expect(
        await authController.newAccessToken(
          newAccessTokenDto,
          req as AuthenticatedRequest,
        ),
      ).toBe(result);
      expect(authService.newAccessToken).toHaveBeenCalledWith(
        newAccessTokenDto,
        req.user,
      );
    });
  });
});
