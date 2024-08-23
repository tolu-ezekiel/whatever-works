import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
// import { LoginUserDto } from '../users/dto/login-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(username: string, pass: string) {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return user;
    }
    return null;
  }

  async signup(signUpUserDto: { username: any; password: any }) {
    // -- TODO fix type
    const { username, password } = signUpUserDto;
    console.log('-----username, password------', username, password);
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      return await this.prisma.user.create({
        data: {
          username,
          password: hashedPassword,
        },
      });
    } catch (error: unknown) {
      console.error(error);
      throw new ConflictException('Username already exists');
    }
  }

  async login(loginUserDto: any): Promise<{ access_token: string }> {
    // TODO -- proper typing
    const user = await this.validateUser(
      loginUserDto.username,
      loginUserDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username, sub: user.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
