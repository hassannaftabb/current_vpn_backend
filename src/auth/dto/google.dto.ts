import { IsEmail, IsObject, IsOptional, IsString } from 'class-validator';
import { Device } from 'src/user/entities/device.type';

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

  @IsOptional()
  @IsObject()
  readonly device: Device;
}
