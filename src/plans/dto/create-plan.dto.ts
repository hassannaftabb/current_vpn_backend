import { IsInt, IsNumber, IsString } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsString()
  durationType: string;

  @IsInt()
  durationInDays: number;

  @IsString()
  price: string;
}
