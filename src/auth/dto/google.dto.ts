import { IsEmail, IsOptional, IsString } from 'class-validator';

export class GoogleAuthDto {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly name: string;

  @IsString()
  @IsOptional()
  readonly phoneNumber: string;

  @IsString()
  readonly googleAccessToken: string;
}
