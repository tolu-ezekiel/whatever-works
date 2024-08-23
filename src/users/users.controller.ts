import {
  Controller,
  Get,
  Patch,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User as UserModel } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guard';

// import { UpdateUserDto } from './dto/update-user.dto';
// import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
// import { Request } from 'express';
// import { GetUser } from '../common/decorators/get-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // get users
  // get users/:id
  // get users/?username={username}
  // patch users/:id {username = new username}

  @UseGuards(AuthGuard)
  @Get('/:id')
  async findById(@Param('id') id: number): Promise<UserModel> {
    return this.usersService.findById(Number(id));
  }

  @UseGuards(AuthGuard)
  @Get('username/:username')
  async findByUsername(
    @Param('username') username: string,
  ): Promise<UserModel | null> {
    return this.usersService.findByUsername(username);
  }

  @UseGuards(AuthGuard)
  @Patch('/:id')
  // @UseGuards(JwtAuthGuard)
  async patchProfile(@Param('id') id: number, @Body() updateUserDto: any) {
    // -- TODO -- fix type
    return this.usersService.updateUser(Number(id), updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Put('/:id')
  async updateProfile(
    @Param('id') id: number,
    @Body() updateUserDto: any,
  ): Promise<UserModel> {
    // -- TODO -- fix type
    return this.usersService.updateUser(Number(id), updateUserDto);
  }
}
