import { IsBoolean, IsString } from 'class-validator';

export class CreateServerDto {
  @IsString()
  name: string;

  @IsString()
  title: string;

  @IsBoolean()
  isPremium: boolean;

  @IsString()
  serverIP: string;

  @IsString()
  countryCode: string;
}
