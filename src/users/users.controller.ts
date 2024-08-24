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
import { User as UserModel } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';
import { AuthenticatedRequest } from './interfaces/user.interface';
import { GetUserDto, UpdateUserDto } from './dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get()
  async findUser(
    @Query('username') getUserDto: GetUserDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<UserModel | null> {
    return this.usersService.findUser({
      username: getUserDto.username,
      user: req.user,
    });
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<UserModel> {
    return this.usersService.findById({ id });
  }

  @UseGuards(AuthGuard)
  @Put('/:id')
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserModel> {
    // -- TODO -- fix type
    return this.usersService.updateUser({
      id,
      username: updateUserDto.username,
    });
  }
}
