import { IsString, IsNotEmpty } from 'class-validator';

export class NewAccessTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
