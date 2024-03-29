import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateServerDto {
  @IsString()
  @IsOptional()
  readonly name?: string;

  @IsString()
  @IsOptional()
  readonly title?: string;

  @IsBoolean()
  @IsOptional()
  isPremium: boolean;

  @IsString()
  @IsOptional()
  serverIP: string;
}
