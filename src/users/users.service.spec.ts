import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { AuthRepository } from '../auth/auth.repository';
import { JwtUser } from './interfaces/user.interface';
import { generateRefreshToken } from '../common/util/refresh-token.util';

jest.mock('../common/util/refresh-token.util');
const mockGenerateRefreshToken = generateRefreshToken as jest.Mock;

const user: User = {
  id: 1,
  username: 'username',
  password: 'hashedpassword',
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
};

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: UsersRepository;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: UsersRepository,
          useValue: {
            findById: jest.fn(),
            findUser: jest.fn(),
            updateUser: jest.fn(),
          },
        },
        {
          provide: AuthRepository,
          useValue: {
            upsertRefreshToken: jest.fn(),
            findRefreshTokenDetails: jest.fn(),
            removeUserRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<UsersRepository>(UsersRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user without the password if the user is found', async () => {
      const userWithoutPassword = {
        ...user,
        password: undefined,
      };

      jest.spyOn(usersRepository, 'findById').mockResolvedValue(user);

      const result = await usersService.findById(1);

      expect(result).toEqual(userWithoutPassword);
      expect(usersRepository.findById).toHaveBeenCalledWith(user.id);
    });

    it('should throw NotFoundException if the user is not found', async () => {
      jest.spyOn(usersRepository, 'findById').mockResolvedValue(null);

      await expect(usersService.findById(1)).rejects.toThrow(NotFoundException);
      expect(usersRepository.findById).toHaveBeenCalledWith(user.id);
    });
  });

  describe('findUser', () => {
    it('should return a user without the password if found by criteria', async () => {
      const queryDto = { username: 'username' };
      jest.spyOn(usersRepository, 'findUser').mockResolvedValue(user);

      const result = await usersService.findUser(queryDto);

      expect(result).toEqual({
        ...user,
        password: undefined,
      });
      expect(usersRepository.findUser).toHaveBeenCalledWith(queryDto);
    });

    it('should return null if no user is found by criteria', async () => {
      const queryDto = { username: 'username' };
      jest.spyOn(usersRepository, 'findUser').mockResolvedValue(null);

      const result = await usersService.findUser(queryDto);

      expect(result).toBeNull();
      expect(usersRepository.findUser).toHaveBeenCalledWith(queryDto);
    });

    it('should search by both requestUser and query criteria if requestUser is provided', async () => {
      const queryDto = { username: 'username' };
      const requestUser: JwtUser = { sub: 1, username: 'username' };

      jest.spyOn(usersRepository, 'findUser').mockResolvedValue(user);

      const result = await usersService.findUser(queryDto, requestUser);

      expect(result).toEqual({
        ...user,
        password: undefined,
      });
      expect(usersRepository.findUser).toHaveBeenCalledWith({
        id: user.id,
        username: user.username,
      });
    });
  });

  describe('updateUsername', () => {
    it('should call UsersRepository.updateUser with correct username and return user and token', async () => {
      const updateUserDto = { username: 'updatedusername' };
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';
      const updatedUser = {
        ...user,
        username: 'updatedusername',
      };

      const updateUsernameRes = {
        accessToken,
        refreshToken,
        user: {
          ...updatedUser,
          password: undefined,
        },
      };

      jest.spyOn(usersRepository, 'updateUser').mockResolvedValue(updatedUser);
      jwtService.signAsync = jest.fn().mockResolvedValue(accessToken);
      mockGenerateRefreshToken.mockResolvedValue(refreshToken);

      const result = await usersService.updateUsername(
        user.id,
        updateUserDto.username,
      );

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        username: updateUserDto.username,
        sub: user.id,
      });
      expect(usersRepository.updateUser).toHaveBeenCalledWith(
        user.id,
        updateUserDto,
      );
      expect(result).toEqual(updateUsernameRes);
    });
  });
});
