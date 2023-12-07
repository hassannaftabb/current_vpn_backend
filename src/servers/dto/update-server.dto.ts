import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateServerDto {
  @IsString()
  @IsOptional()
  readonly name?: string;

  @IsBoolean()
  @IsOptional()
  isPremium: boolean;

  @IsString()
  @IsOptional()
  configFilePath: string;
}
