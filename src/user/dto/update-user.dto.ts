import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  readonly name?: string;

  @IsEmail()
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @IsString()
  @IsOptional()
  readonly password?: string;

  @IsString()
  @IsOptional()
  readonly phoneNumber?: string;

  @IsNumber()
  @IsOptional()
  readonly time?: string;

  @IsString()
  @IsOptional()
  readonly location?: string;
}
