import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { GetUserQueryDto } from './dto/get-user.dto';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { AuthenticatedRequest } from './interfaces/user.interface';

const user: User = {
  id: 1,
  username: 'username',
  password: 'hashedpassword',
  created_at: new Date(),
  updated_at: new Date(),
  deleted_at: null,
};

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        AuthGuard,
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
            findUser: jest.fn(),
            updateUsername: jest.fn(),
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

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should call UsersService.findById with the correct id and return the user', async () => {
      const userWithoutPassword = {
        ...user,
        password: undefined,
      };

      jest
        .spyOn(usersService, 'findById')
        .mockResolvedValue(userWithoutPassword);

      expect(await usersController.findById(1)).toBe(userWithoutPassword);
      expect(usersService.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('findUser', () => {
    it('should call UsersService.findUser with the correct query and user and return the result', async () => {
      const queryDto: GetUserQueryDto = { username: 'username' };
      const req: Partial<AuthenticatedRequest> = {
        user: { sub: 1, username: 'username' },
      };
      const userWithoutPassword = {
        ...user,
        password: undefined,
      };
      jest
        .spyOn(usersService, 'findUser')
        .mockResolvedValue(userWithoutPassword);

      expect(
        await usersController.findUser(queryDto, req as AuthenticatedRequest),
      ).toBe(userWithoutPassword);
      expect(usersService.findUser).toHaveBeenCalledWith(queryDto, req.user);
    });
  });

  describe('updateUsername', () => {
    it('should call UsersService.updateUsername with the correct id and updateUsernameDto and return new access token', async () => {
      const updateUsernameDto: UpdateUsernameDto = {
        username: 'updatedusername',
      };
      const updateUsernameRes = {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        user: {
          ...user,
          password: undefined,
          username: 'updatedusername',
        },
      };

      jest
        .spyOn(usersService, 'updateUsername')
        .mockResolvedValue(updateUsernameRes);

      expect(
        await usersController.updateUsername(
          updateUsernameRes.user.id,
          updateUsernameDto,
        ),
      ).toBe(updateUsernameRes);
      expect(usersService.updateUsername).toHaveBeenCalledWith(
        updateUsernameRes.user.id,
        updateUsernameDto.username,
      );
    });
  });
});
