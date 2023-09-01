import { IsEmail, IsString } from 'class-validator';

export class AdminAuthDto {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly password: string;
}
