import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { CreateOverrideDto } from './dto/create-override.dto';
@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private validateTimeRange(startTime: string, endTime: string) {
    if (
      this.timeToMinutes(startTime) >=
      this.timeToMinutes(endTime)
    ) {
      throw new BadRequestException(
        'Start time must be before end time',
      );
    }
  }

  private async validateOverlap(
    userId: number,
    dayOfWeek: any,
    startTime: string,
    endTime: string,
    excludeId?: number,
  ) {
    const slots =
      await this.prisma.recurringAvailability.findMany({
        where: {
          userId,
          dayOfWeek,
        },
      });

    const newStart = this.timeToMinutes(startTime);
    const newEnd = this.timeToMinutes(endTime);

    for (const slot of slots) {
      if (excludeId && slot.id === excludeId) continue;

      const oldStart = this.timeToMinutes(slot.startTime);
      const oldEnd = this.timeToMinutes(slot.endTime);

      if (newStart < oldEnd && newEnd > oldStart) {
        throw new BadRequestException(
          'Overlapping availability slot',
        );
      }

      if (
        slot.startTime === startTime &&
        slot.endTime === endTime
      ) {
        throw new BadRequestException(
          'Duplicate availability slot',
        );
      }
    }
  }

  async createAvailability(
    userId: number,
    dto: CreateAvailabilityDto,
  ) {
    this.validateTimeRange(dto.startTime, dto.endTime);

    const doctor =
      await this.prisma.doctorProfile.findUnique({
        where: {
          userId,
        },
      });

    if (!doctor) {
      throw new NotFoundException(
        'Doctor profile not found',
      );
    }

    await this.validateOverlap(
      userId,
      dto.dayOfWeek,
      dto.startTime,
      dto.endTime,
    );

    return this.prisma.recurringAvailability.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async getAvailability(userId: number) {
    return this.prisma.recurringAvailability.findMany({
      where: {
        userId,
      },
      orderBy: [
        {
          dayOfWeek: 'asc',
        },
        {
          startTime: 'asc',
        },
      ],
    });
  }
  async updateAvailability(
  id: number,
  userId: number,
  dto: UpdateAvailabilityDto,
) {
  const availability =
    await this.prisma.recurringAvailability.findFirst({
      where: {
        id,
        userId,
      },
    });

  if (!availability) {
    throw new NotFoundException(
      'Availability not found',
    );
  }

  const dayOfWeek =
    dto.dayOfWeek ?? availability.dayOfWeek;
  const startTime =
    dto.startTime ?? availability.startTime;
  const endTime =
    dto.endTime ?? availability.endTime;

  this.validateTimeRange(startTime, endTime);

  await this.validateOverlap(
    userId,
    dayOfWeek,
    startTime,
    endTime,
    id,
  );

  return this.prisma.recurringAvailability.update({
    where: {
      id,
    },
    data: dto,
  });
}

async deleteAvailability(
  id: number,
  userId: number,
) {
  const availability =
    await this.prisma.recurringAvailability.findFirst({
      where: {
        id,
        userId,
      },
    });

  if (!availability) {
    throw new NotFoundException(
      'Availability not found',
    );
  }

  await this.prisma.recurringAvailability.delete({
    where: {
      id,
    },
  });

  return {
    message: 'Availability deleted successfully',
  };
}
async createOverride(
  userId: number,
  dto: CreateOverrideDto,
) {
  this.validateTimeRange(dto.startTime, dto.endTime);

  const existing =
    await this.prisma.customAvailability.findFirst({
      where: {
        userId,
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    });

  if (existing) {
    throw new BadRequestException(
      'Override already exists',
    );
  }

  return this.prisma.customAvailability.create({
    data: {
      userId,
      date: new Date(dto.date),
      startTime: dto.startTime,
      endTime: dto.endTime,
    },
  });
}

async getAvailabilityByDate(
  userId: number,
  date: string,
) {
  const targetDate = new Date(date);

  if (isNaN(targetDate.getTime())) {
    throw new BadRequestException('Invalid date');
  }

  const overrides =
    await this.prisma.customAvailability.findMany({
      where: {
        userId,
        date: targetDate,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

  if (overrides.length > 0) {
    return {
      source: 'custom',
      availability: overrides,
    };
  }

  const days = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ];

  const dayOfWeek = days[targetDate.getDay()];

  const recurring =
    await this.prisma.recurringAvailability.findMany({
      where: {
        userId,
        dayOfWeek: dayOfWeek as any,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

  return {
    source: 'recurring',
    availability: recurring,
  };
}
}