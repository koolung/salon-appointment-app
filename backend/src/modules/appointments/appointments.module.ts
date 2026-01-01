import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { PrismaModule } from '@/common/prisma/prisma.module';
import { AvailabilityModule } from '@/modules/availability/availability.module';

@Module({
  imports: [PrismaModule, AvailabilityModule],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
