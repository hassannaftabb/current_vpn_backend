import { IsBoolean, IsString } from 'class-validator';

export class CreateServerDto {
  @IsString()
  name: string;

  @IsBoolean()
  isPremium: boolean;

  @IsString()
  configFilePath: string;
}
