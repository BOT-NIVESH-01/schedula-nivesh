import {
  Body,
  Controller,
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
      req.user.userId,
      dto,
    );
  }
}