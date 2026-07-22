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

import { PatientService } from './patient.service';
import { CreatePatientProfileDto } from './dto/create-patient-profile.dto';
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';

@Controller('patient')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.PATIENT)
export class PatientController {
  constructor(
    private readonly patientService: PatientService,
  ) {}

  @Post('profile')
  createProfile(
    @Req() req: any,
    @Body() createPatientProfileDto: CreatePatientProfileDto,
  ) {
    return this.patientService.createProfile(
      req.user.id,
      createPatientProfileDto,
    );
  }

  @Get('profile')
  getProfile(@Req() req: any) {
    return this.patientService.getProfile(req.user.id);
  }

  @Patch('profile')
  updateProfile(
    @Req() req: any,
    @Body() updatePatientProfileDto: UpdatePatientProfileDto,
  ) {
    return this.patientService.updateProfile(
      req.user.id,
      updatePatientProfileDto,
    );
  }
}