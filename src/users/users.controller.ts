import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import {
  AuthenticatedRequest,
  UserWithOptionalPassword,
} from './interfaces/user.interface';
import { GetUserQueryDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get('/:id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserWithOptionalPassword> {
    return this.usersService.findById(id);
  }

  @UseGuards(AuthGuard)
  @Get()
  async findUser(
    @Query() getUserQueryDto: GetUserQueryDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<UserWithOptionalPassword | null> {
    return this.usersService.findUser(getUserQueryDto, req.user);
  }

  @UseGuards(AuthGuard)
  @Put('/:id')
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(id, updateUserDto);
  }
}
