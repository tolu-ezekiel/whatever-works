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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import {
  AuthenticatedRequest,
  UserWithOptionalPassword,
  UpdateUsernameResponse,
} from './interfaces/user.interface';
import { GetUserQueryDto } from './dto/get-user.dto';
import { UpdateUsernameDto } from './dto/update-username.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserWithOptionalPassword> {
    return this.usersService.findById(id);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findUser(
    @Query() getUserQueryDto: GetUserQueryDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<UserWithOptionalPassword | null> {
    return this.usersService.findUser(getUserQueryDto, req.user);
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Put('/:id/username')
  async updateUsername(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsernameDto: UpdateUsernameDto,
  ): Promise<UpdateUsernameResponse> {
    return this.usersService.updateUsername(id, updateUsernameDto.username);
  }
}
