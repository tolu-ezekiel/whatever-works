import { IsString, IsNotEmpty } from 'class-validator';

export class GetUserQueryDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}
