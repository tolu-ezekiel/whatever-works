import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class SignUpUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class loginUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class NewAccessTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
