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
import { GetUserQueryDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get()
  async findUser(
    @Query('username') getUserQueryDto: GetUserQueryDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<UserModel | null> {
    return this.usersService.findUser(getUserQueryDto, req.user);
  }

  @UseGuards(AuthGuard)
  @Get('/:id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<UserModel> {
    return this.usersService.findById(id);
  }

  @UseGuards(AuthGuard)
  @Put('/:id')
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserModel> {
    // -- TODO -- fix type
    return this.usersService.updateUser(id, updateUserDto);
  }
}
