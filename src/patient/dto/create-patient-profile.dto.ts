import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  Min,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class CreatePatientProfileDto {
  @IsInt()
  @Min(0)
  age!: number;

  @IsEnum(Gender)
  gender!: Gender;

  @IsString()
  contactDetails!: string;

  @IsOptional()
  @IsString()
  healthInformation?: string;
}