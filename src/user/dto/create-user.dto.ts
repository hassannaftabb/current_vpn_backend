import {
  IsEmail,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ProviderEnum } from '../entities/enums/provider.enum';
import { Device } from '../entities/device.type';

export class CreateUserDto {
  @IsString()
  readonly name: string;

  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @IsString()
  @IsOptional()
  readonly password?: string;

  @IsString()
  @IsOptional()
  readonly phoneNumber?: string;

  @IsString()
  @IsOptional()
  readonly googleAccessToken?: string;

  @IsOptional()
  @IsEnum(ProviderEnum)
  readonly provider?: string;

  @IsObject()
  readonly device: Device;
}
