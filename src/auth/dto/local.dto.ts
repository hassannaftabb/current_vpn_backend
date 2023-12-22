import { IsEmail, IsObject, IsString } from 'class-validator';
import { Device } from 'src/user/entities/device.type';

export class EmailLoginDto {
  @IsString()
  @IsEmail()
  readonly email: string;

  @IsString()
  readonly password: string;

  @IsObject()
  readonly device: Device;
}
