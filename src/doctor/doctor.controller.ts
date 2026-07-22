import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator/roles.decorator';
import { Role } from '../common/enums/role.enum';

import { DoctorService } from './doctor.service';
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';

@Controller('doctor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DOCTOR)
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post('profile')
  createProfile(
    @Req() req: any,
    @Body() createDoctorProfileDto: CreateDoctorProfileDto,
  ) {
    return this.doctorService.createProfile(
      req.user.id,
      createDoctorProfileDto,
    );
  }

  @Get('profile')
  getProfile(@Req() req: any) {
    return this.doctorService.getProfile(req.user.id);
  }

  @Patch('profile')
  updateProfile(
    @Req() req: any,
    @Body() updateDoctorProfileDto: UpdateDoctorProfileDto,
  ) {
    return this.doctorService.updateProfile(
      req.user.id,
      updateDoctorProfileDto,
    );
  }
}