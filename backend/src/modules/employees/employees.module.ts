import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { PrismaModule } from '@/common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
