import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientProfileDto } from './dto/create-patient-profile.dto';
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';

@Injectable()
export class PatientService {
  constructor(private readonly prisma: PrismaService) {}

  async createProfile(
    userId: number,
    createPatientProfileDto: CreatePatientProfileDto,
  ) {
    const existingProfile = await this.prisma.patientProfile.findUnique({
      where: {
        userId,
      },
    });

    if (existingProfile) {
      throw new BadRequestException(
        'Patient profile already exists',
      );
    }

    return this.prisma.patientProfile.create({
      data: {
        ...createPatientProfileDto,
        userId,
      },
    });
  }

  async getProfile(userId: number) {
    const profile = await this.prisma.patientProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!profile) {
      throw new NotFoundException(
        'Patient profile not found',
      );
    }

    return profile;
  }

  async updateProfile(
    userId: number,
    updatePatientProfileDto: UpdatePatientProfileDto,
  ) {
    const profile = await this.prisma.patientProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!profile) {
      throw new NotFoundException(
        'Patient profile not found',
      );
    }

    return this.prisma.patientProfile.update({
      where: {
        userId,
      },
      data: updatePatientProfileDto,
    });
  }
}