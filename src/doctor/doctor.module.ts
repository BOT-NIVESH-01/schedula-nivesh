import { Module } from '@nestjs/common';
import { DoctorController } from './doctor.controller';
import { AuthModule } from '../auth/auth.module';
import { DoctorService } from './doctor.service';

@Module({
  imports: [AuthModule],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {}