import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator/roles.decorator';
import { Role } from '../common/enums/role.enum';

import { AvailabilityService } from './availability.service';
import { Query } from '@nestjs/common';
import { CreateOverrideDto } from './dto/create-override.dto';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';

@Controller('doctor/availability')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DOCTOR)
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
  ) {}

  @Post()
  createAvailability(
    @Req() req: any,
    @Body() createAvailabilityDto: CreateAvailabilityDto,
  ) {
    return this.availabilityService.createAvailability(
      req.user.id,
      createAvailabilityDto,
    );
  }

  @Get()
  getAvailability(@Req() req: any) {
    return this.availabilityService.getAvailability(
      req.user.id,
    );
  }

  @Patch(':id')
  updateAvailability(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
  ) {
    return this.availabilityService.updateAvailability(
      Number(id),
      req.user.id,
      updateAvailabilityDto,
    );
  }

  @Delete(':id')
  deleteAvailability(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    return this.availabilityService.deleteAvailability(
      Number(id),
      req.user.id,
    );
  }
  @Post('override')
createOverride(
  @Req() req: any,
  @Body() createOverrideDto: CreateOverrideDto,
) {
  return this.availabilityService.createOverride(
    req.user.id,
    createOverrideDto,
  );
}

@Get('date')
getAvailabilityByDate(
  @Req() req: any,
  @Query('date') date: string,
) {
  return this.availabilityService.getAvailabilityByDate(
    req.user.id,
    date,
  );
}
}