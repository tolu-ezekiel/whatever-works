import { IsString, IsNotEmpty } from 'class-validator';

export class GetUserQueryDto {
  @IsString({ message: 'query string username must be a string' })
  @IsNotEmpty({ message: 'query string username should not be empty' })
  username: string;
}
