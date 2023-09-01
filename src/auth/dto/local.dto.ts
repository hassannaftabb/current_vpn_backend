import { IsEmail, IsString } from 'class-validator';

export class EmailLoginDto {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly password: string;
}
