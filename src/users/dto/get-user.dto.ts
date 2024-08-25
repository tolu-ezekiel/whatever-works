import { IsString, IsNotEmpty } from 'class-validator';

export class GetUserQueryDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}
