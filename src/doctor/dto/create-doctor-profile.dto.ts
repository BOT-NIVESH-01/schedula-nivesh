import {
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateDoctorProfileDto {
  @IsString()
  specialization!: string;

  @IsInt()
  @Min(0)
  experience!: number;

  @IsString()
  qualification!: string;

  @IsNumber()
  consultationFee!: number;

  @IsString()
  availability!: string;

  @IsOptional()
  @IsString()
  profileDetails?: string;
}