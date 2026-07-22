import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';

@Injectable()
export class DoctorService {
  constructor(private readonly prisma: PrismaService) {}

  async createProfile(
    userId: number,
    createDoctorProfileDto: CreateDoctorProfileDto,
  ) {
    const existingProfile = await this.prisma.doctorProfile.findUnique({
      where: {
        userId,
      },
    });

    if (existingProfile) {
      throw new BadRequestException(
        'Doctor profile already exists',
      );
    }

    return this.prisma.doctorProfile.create({
      data: {
        ...createDoctorProfileDto,
        userId,
      },
    });
  }

  async getProfile(userId: number) {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!profile) {
      throw new NotFoundException(
        'Doctor profile not found',
      );
    }

    return profile;
  }

  async updateProfile(
    userId: number,
    updateDoctorProfileDto: UpdateDoctorProfileDto,
  ) {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!profile) {
      throw new NotFoundException(
        'Doctor profile not found',
      );
    }

    return this.prisma.doctorProfile.update({
      where: {
        userId,
      },
      data: updateDoctorProfileDto,
    });
  }
}