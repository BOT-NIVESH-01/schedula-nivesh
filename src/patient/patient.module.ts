import { Module } from '@nestjs/common';
import { PatientController } from './patient.controller';
import { AuthModule } from '../auth/auth.module';
import { PatientService } from './patient.service';

@Module({
  imports: [AuthModule],
  controllers: [PatientController],
  providers: [PatientService],
})
export class PatientModule {}