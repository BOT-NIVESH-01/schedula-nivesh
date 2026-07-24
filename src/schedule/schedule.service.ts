import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import {
  Prisma,
  SchedulingType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createSchedule(
    doctorId: number,
    dto: CreateScheduleDto,
  ) {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    // Invalid time range
    if (startTime >= endTime) {
      throw new BadRequestException(
        'End time must be greater than start time',
      );
    }

    // Past schedule
    if (startTime <= new Date()) {
      throw new BadRequestException(
        'Cannot create schedule in the past',
      );
    }

    // Conflict check
    const conflict =
      await this.prisma.doctorSchedule.findFirst({
        where: {
          doctorId,
          startTime: {
            lt: endTime,
          },
          endTime: {
            gt: startTime,
          },
        },
      });

    if (conflict) {
      throw new BadRequestException(
        'Conflicting schedule already exists',
      );
    }

    // STREAM validation
    if (
      dto.schedulingType === SchedulingType.STREAM
    ) {
      if (!dto.slotDuration) {
        throw new BadRequestException(
          'Slot duration is required',
        );
      }

      if (dto.slotDuration <= 0) {
        throw new BadRequestException(
          'Invalid slot duration',
        );
      }

      if (
        dto.bufferTime &&
        dto.bufferTime < 0
      ) {
        throw new BadRequestException(
          'Invalid buffer time',
        );
      }
    }

    // WAVE validation
    if (
      dto.schedulingType === SchedulingType.WAVE
    ) {
      if (!dto.maxCapacity) {
        throw new BadRequestException(
          'Maximum capacity is required',
        );
      }

      if (dto.maxCapacity <= 0) {
        throw new BadRequestException(
          'Invalid maximum capacity',
        );
      }
    }

    return this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const schedule =
          await tx.doctorSchedule.create({
            data: {
              doctorId,
              schedulingType:
                dto.schedulingType,
              startTime,
              endTime,
              slotDuration:
                dto.slotDuration,
              bufferTime:
                dto.bufferTime ?? 0,
              maxCapacity:
                dto.maxCapacity,
            },
          });

        // Generate STREAM slots
        if (
          dto.schedulingType ===
          SchedulingType.STREAM
        ) {
          let current = new Date(startTime);

          while (true) {
            const slotEnd = new Date(
              current.getTime() +
                dto.slotDuration! * 60000,
            );

            if (slotEnd > endTime) {
              break;
            }

            await tx.scheduleSlot.create({
              data: {
                scheduleId: schedule.id,
                startTime: new Date(current),
                endTime: slotEnd,
              },
            });

            current = new Date(
              slotEnd.getTime() +
                (dto.bufferTime ?? 0) *
                  60000,
            );
          }
        }

        return schedule;
      },
    );
  }
}