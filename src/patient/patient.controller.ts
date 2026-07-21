import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('patient')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientController {
  @Get('profile')
  @Roles(Role.PATIENT)
  getProfile(@Req() req: any) {
    return {
      message: 'Patient profile fetched successfully',
      user: req.user,
    };
  }
}