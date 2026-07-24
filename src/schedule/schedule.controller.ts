import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator/roles.decorator';

import { Role } from '../common/enums/role.enum';

@Controller('schedule')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ScheduleController {
  constructor(
    private readonly scheduleService: ScheduleService,
  ) {}

  @Post()
  @Roles(Role.DOCTOR)
  async createSchedule(
    @Req() req: any,
    @Body() dto: CreateScheduleDto,
  ) {
    return this.scheduleService.createSchedule(
      req.user.id,
      dto,
    );
  }

  @Get()
  @Roles(Role.DOCTOR)
  async getSchedules(
    @Req() req: any,
  ) {
    return this.scheduleService.getDoctorSchedules(
      req.user.id,
    );
  }

  @Get(':id')
  @Roles(Role.DOCTOR)
  async getSchedule(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.scheduleService.getScheduleById(
      req.user.id,
      id,
    );
  }

  @Patch(':id')
  @Roles(Role.DOCTOR)
  async updateSchedule(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateScheduleDto,
  ) {
    return this.scheduleService.updateSchedule(
      req.user.id,
      id,
      dto,
    );
  }

  @Delete(':id')
  @Roles(Role.DOCTOR)
  async deleteSchedule(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.scheduleService.deleteSchedule(
      req.user.id,
      id,
    );
  }

  @Get('doctor/:doctorId/availability')
  async getAvailability(
    @Param('doctorId', ParseIntPipe) doctorId: number,
  ) {
    return this.scheduleService.getDoctorAvailability(
      doctorId,
    );
  }

  @Post(':scheduleId/book/stream/:slotId')
  @Roles(Role.PATIENT)
  async bookStream(
    @Req() req: any,
    @Param('scheduleId', ParseIntPipe) scheduleId: number,
    @Param('slotId', ParseIntPipe) slotId: number,
  ) {
    return this.scheduleService.bookStreamAppointment(
      req.user.id,
      scheduleId,
      slotId,
    );
  }
@Post(':scheduleId/book/wave')
@Roles(Role.PATIENT)
async bookWave(
  @Req() req: any,
  @Param('scheduleId', ParseIntPipe) scheduleId: number,
) {
  return this.scheduleService.bookWaveAppointment(
    req.user.id,
    scheduleId,
  );
}
}