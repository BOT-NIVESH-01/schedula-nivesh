import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AppointmentStatus,
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

  private validateTimeRange(
    startTime: Date,
    endTime: Date,
  ) {
    if (startTime >= endTime) {
      throw new BadRequestException(
        'End time must be greater than start time',
      );
    }

    if (startTime <= new Date()) {
      throw new BadRequestException(
        'Cannot create schedule in the past',
      );
    }
  }

  private async validateConflict(
    doctorId: number,
    startTime: Date,
    endTime: Date,
  ) {
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
  }

  private validateConfiguration(
    dto: CreateScheduleDto,
  ) {
    if (
      dto.schedulingType === SchedulingType.STREAM
    ) {
      if (!dto.slotDuration || dto.slotDuration <= 0) {
        throw new BadRequestException(
          'Invalid slot duration',
        );
      }

      if (
        dto.bufferTime !== undefined &&
        dto.bufferTime < 0
      ) {
        throw new BadRequestException(
          'Invalid buffer time',
        );
      }
    }

    if (
      dto.schedulingType === SchedulingType.WAVE
    ) {
      if (!dto.maxCapacity || dto.maxCapacity <= 0) {
        throw new BadRequestException(
          'Invalid maximum capacity',
        );
      }
    }
  }

  async createSchedule(
    doctorId: number,
    dto: CreateScheduleDto,
  ) {
    const startTime = new Date(dto.startTime);
    const endTime = new Date(dto.endTime);

    this.validateTimeRange(startTime, endTime);

    await this.validateConflict(
      doctorId,
      startTime,
      endTime,
    );

    this.validateConfiguration(dto);

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

        return {
          message: 'Schedule created successfully',
          schedule,
        };
      },
    );
}
      async getDoctorSchedules(doctorId: number) {
    return this.prisma.doctorSchedule.findMany({
      where: {
        doctorId,
      },
      include: {
        slots: {
          orderBy: {
            startTime: 'asc',
          },
        },
        appointments: {
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async getScheduleById(
    doctorId: number,
    scheduleId: number,
  ) {
    const schedule =
      await this.prisma.doctorSchedule.findFirst({
        where: {
          id: scheduleId,
          doctorId,
        },
        include: {
          slots: {
            orderBy: {
              startTime: 'asc',
            },
          },
          appointments: {
            include: {
              patient: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

    if (!schedule) {
      throw new NotFoundException(
        'Schedule not found',
      );
    }

    return schedule;
  }

async updateSchedule(
  doctorId: number,
  scheduleId: number,
  dto: CreateScheduleDto,
) {
  const schedule =
    await this.prisma.doctorSchedule.findFirst({
      where: {
        id: scheduleId,
        doctorId,
      },
      include: {
        appointments: true,
      },
    });

  if (!schedule) {
    throw new NotFoundException(
      'Schedule not found',
    );
  }

  if (schedule.appointments.length > 0) {
    throw new BadRequestException(
      'Cannot update a schedule with booked appointments',
    );
  }

  const startTime = new Date(dto.startTime);
  const endTime = new Date(dto.endTime);

  this.validateTimeRange(startTime, endTime);
  this.validateConfiguration(dto);

  await this.validateConflict(
    doctorId,
    startTime,
    endTime,
  );

  return this.prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const updated =
        await tx.doctorSchedule.update({
          where: {
            id: scheduleId,
          },
          data: {
            schedulingType: dto.schedulingType,
            startTime,
            endTime,
            slotDuration: dto.slotDuration,
            bufferTime: dto.bufferTime ?? 0,
            maxCapacity: dto.maxCapacity,
          },
        });

      await tx.scheduleSlot.deleteMany({
        where: {
          scheduleId,
        },
      });

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
              scheduleId,
              startTime: new Date(current),
              endTime: slotEnd,
            },
          });

          current = new Date(
            slotEnd.getTime() +
              (dto.bufferTime ?? 0) * 60000,
          );
        }
      }

      return {
  success: true,
  message: 'Schedule created successfully',
  data: schedule,
};
    },
  );
}

  async deleteSchedule(
    doctorId: number,
    scheduleId: number,
  ) {
    const schedule =
      await this.prisma.doctorSchedule.findFirst({
        where: {
          id: scheduleId,
          doctorId,
        },
      });

    if (!schedule) {
      throw new NotFoundException(
        'Schedule not found',
      );
    }

    const appointmentCount =
      await this.prisma.appointment.count({
        where: {
          scheduleId,
          status: AppointmentStatus.BOOKED,
        },
      });

    if (appointmentCount > 0) {
      throw new BadRequestException(
        'Cannot delete a schedule with booked appointments',
      );
    }

    await this.prisma.doctorSchedule.delete({
      where: {
        id: scheduleId,
      },
    });

    return {
      message: 'Schedule deleted successfully',
    };
  }
    async bookStreamAppointment(
    patientId: number,
    scheduleId: number,
    slotId: number,
  ) {
    const schedule = await this.prisma.doctorSchedule.findFirst({
      where: {
        id: scheduleId,
        schedulingType: SchedulingType.STREAM,
      },
    });

    if (!schedule) {
      throw new NotFoundException(
        'Stream schedule not found',
      );
    }

    const existing = await this.prisma.appointment.findFirst({
      where: {
        patientId,
        scheduleId,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Patient already booked this schedule',
      );
    }

    const slot = await this.prisma.scheduleSlot.findFirst({
      where: {
        id: slotId,
        scheduleId,
      },
    });

    if (!slot) {
      throw new NotFoundException(
        'Slot not found',
      );
    }

    if (slot.isBooked) {
      throw new BadRequestException(
        'Slot already booked',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.scheduleSlot.update({
        where: {
          id: slotId,
        },
        data: {
          isBooked: true,
        },
      });

      const appointment =
        await tx.appointment.create({
          data: {
            patientId,
            scheduleId,
            slotId,
          },
        });

      return {
  success: true,
  message: 'Appointment booked successfully',
  data: {
    appointmentId: appointment.id,
    appointmentTime: {
      start: slot.startTime,
      end: slot.endTime,
    },
    status: appointment.status,
  },
};
    });
  }

  async bookWaveAppointment(
    patientId: number,
    scheduleId: number,
  ) {
    const schedule =
      await this.prisma.doctorSchedule.findFirst({
        where: {
          id: scheduleId,
          schedulingType: SchedulingType.WAVE,
        },
      });

    if (!schedule) {
      throw new NotFoundException(
        'Wave schedule not found',
      );
    }

    const existing =
      await this.prisma.appointment.findFirst({
        where: {
          patientId,
          scheduleId,
        },
      });

    if (existing) {
      throw new BadRequestException(
        'Patient already booked this schedule',
      );
    }

    const bookedCount =
      await this.prisma.appointment.count({
        where: {
          scheduleId,
          status: AppointmentStatus.BOOKED,
        },
      });

    if (
      bookedCount >=
      (schedule.maxCapacity ?? 0)
    ) {
      throw new BadRequestException(
        'Wave is full'
      );
    }

    const tokenNumber = bookedCount + 1;

    const appointment =
      await this.prisma.appointment.create({
        data: {
          patientId,
          scheduleId,
          tokenNumber,
        },
      });

    return {
  success: true,
  message: 'Appointment booked successfully',
  data: {
    appointmentId: appointment.id,
    appointmentWindow: {
      start: schedule.startTime,
      end: schedule.endTime,
    },
    tokenNumber,
    status: appointment.status,
  },
};
  }

  async getDoctorAvailability(
    doctorId: number,
  ) {
    const schedules =
      await this.prisma.doctorSchedule.findMany({
        where: {
          doctorId,
        },
        include: {
          slots: true,
          appointments: true,
        },
        orderBy: {
          startTime: 'asc',
        },
      });

    return schedules.map((schedule) => {
      if (
        schedule.schedulingType ===
        SchedulingType.STREAM
      ) {
        return {
          scheduleId: schedule.id,
          type: 'STREAM',
          slots: schedule.slots.map((slot) => ({
            id: slot.id,
            startTime: slot.startTime,
            endTime: slot.endTime,
            available: !slot.isBooked,
          })),
        };
      }

      return {
        scheduleId: schedule.id,
        type: 'WAVE',
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        maxCapacity: schedule.maxCapacity,
        booked: schedule.appointments.length,
        available:
          (schedule.maxCapacity ?? 0) -
          schedule.appointments.length,
      };
    });
  }
  }