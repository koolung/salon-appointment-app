import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllEmployees(isActive = true) {
    return this.prisma.employee.findMany({
      where: { isActive },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        performance: true,
      },
    });
  }

  async getEmployeeById(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        performance: true,
        availabilityRules: true,
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async updateEmployee(employeeId: string, data: any) {
    return this.prisma.employee.update({
      where: { id: employeeId },
      data,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        performance: true,
      },
    });
  }

  async getEmployeePerformance(employeeId: string) {
    const performance = await this.prisma.employeePerformance.findUnique({
      where: { employeeId },
    });

    if (!performance) {
      throw new NotFoundException('Performance data not found');
    }

    return performance;
  }
}
