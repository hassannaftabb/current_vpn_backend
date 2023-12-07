import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { ObjectId } from 'mongodb';

export class CreateSubscriptionDto {
  @IsDate()
  @IsOptional()
  expiryDate: Date;

  @IsInt()
  @IsOptional()
  planDuration?: number;

  @IsBoolean()
  isActive: boolean;

  @IsBoolean()
  isExpired: boolean;

  @IsOptional()
  @IsString()
  planName: string;

  @IsOptional()
  @IsString()
  userId: string | ObjectId;
}
