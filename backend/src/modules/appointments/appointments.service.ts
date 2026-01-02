import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { AvailabilityService } from '@/modules/availability/availability.service';

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availabilityService: AvailabilityService,
  ) {}

  async createAppointment(data: {
    clientId: string;
    employeeId: string | null;
    startTime: Date;
    endTime: Date;
    serviceIds: string[];
    notes?: string;
    clientTimezone?: string;
    bookingSource?: string;
  }) {
    let finalEmployeeId: string;
    let clientRecordId: string;

    // Get or create client record from userId
    // For admin bookings, clientId is 'temp-admin-booking' so we create a temporary client
    if (data.clientId === 'temp-admin-booking') {
      // Create a temporary client without userId (for admin-booked appointments)
      const clientRecord = await this.prisma.client.create({
        data: {
          userId: null, // Allow null for admin-created clients
        },
      });
      clientRecordId = clientRecord.id;
    } else {
      // For regular clients, expect a valid userId
      const existingClient = await this.prisma.client.findUnique({
        where: { userId: data.clientId },
      });

      if (!existingClient) {
        // Create a client record for this user
        const clientRecord = await this.prisma.client.create({
          data: {
            userId: data.clientId,
          },
        });
        clientRecordId = clientRecord.id;
      } else {
        clientRecordId = existingClient.id;
      }
    }

    // If no preference, find an available employee for this time slot
    if (!data.employeeId) {
      const employees = await this.prisma.employee.findMany({
        where: { isActive: true },
      });

      // Check each employee for availability
      let availableEmployee: any = null;
      for (const emp of employees) {
        const isAvailable = await this.availabilityService.checkAvailability(
          emp.id,
          data.startTime,
          data.endTime,
        );

        if (isAvailable) {
          // Check for conflicts
          const conflict = await this.prisma.appointment.findFirst({
            where: {
              employeeId: emp.id,
              status: {
                in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
              },
              OR: [
                {
                  startTime: { lt: data.endTime },
                  endTime: { gt: data.startTime },
                },
              ],
            },
          });

          if (!conflict) {
            availableEmployee = emp;
            break;
          }
        }
      }

      if (!availableEmployee) {
        throw new BadRequestException('No employees available for the selected time slot');
      }

      finalEmployeeId = availableEmployee.id;
    } else {
      finalEmployeeId = data.employeeId;

      // Validate that employee is available
      const isAvailable = await this.availabilityService.checkAvailability(
        finalEmployeeId,
        data.startTime,
        data.endTime,
      );

      if (!isAvailable) {
        throw new BadRequestException('Selected time slot is not available');
      }

      // Check for conflicts
      const conflict = await this.prisma.appointment.findFirst({
        where: {
          employeeId: finalEmployeeId,
          status: {
            in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'],
          },
          OR: [
            {
              startTime: { lt: data.endTime },
              endTime: { gt: data.startTime },
            },
          ],
        },
      });

      if (conflict) {
        throw new BadRequestException('Time slot conflicts with existing appointment');
      }
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        clientId: clientRecordId,
        employeeId: finalEmployeeId,
        startTime: data.startTime,
        endTime: data.endTime,
        notes: data.notes,
        clientTimezone: data.clientTimezone || 'UTC',
        bookingSource: data.bookingSource || 'WEB',
        status: 'PENDING',
        services: {
          create: await Promise.all(
            data.serviceIds.map(async (serviceId) => {
              const service = await this.prisma.service.findUnique({
                where: { id: serviceId },
              });
              if (!service) {
                throw new Error(`Service ${serviceId} not found`);
              }
              return {
                serviceId,
                duration: service.baseDuration,
                price: service.price,
              };
            }),
          ),
        },
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        client: {
          include: {
            user: true,
          },
        },
        employee: {
          include: {
            user: true,
          },
        },
      },
    });

    return appointment;
  }

  async getAppointment(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        client: {
          include: {
            user: true,
          },
        },
        employee: {
          include: {
            user: true,
          },
        },
        payments: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async getAppointmentsByClient(clientId: string) {
    return this.prisma.appointment.findMany({
      where: { clientId },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        employee: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async getAppointmentsByEmployee(employeeId: string, startDate?: Date, endDate?: Date) {
    return this.prisma.appointment.findMany({
      where: {
        employeeId,
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        client: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async confirmAppointment(appointmentId: string) {
    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CONFIRMED' },
      include: {
        services: {
          include: {
            service: true,
          },
        },
        client: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async cancelAppointment(appointmentId: string) {
    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' },
    });
  }

  async rescheduleAppointment(
    appointmentId: string,
    newStartTime: Date,
    newEndTime: Date,
  ) {
    const appointment = await this.getAppointment(appointmentId);

    // Validate new time is available
    const isAvailable = await this.availabilityService.checkAvailability(
      appointment.employeeId,
      newStartTime,
      newEndTime,
    );

    if (!isAvailable) {
      throw new BadRequestException('New time slot is not available');
    }

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        startTime: newStartTime,
        endTime: newEndTime,
        status: 'PENDING',
      },
      include: {
        services: {
          include: {
            service: true,
          },
        },
      },
    });
  }

  async completeAppointment(appointmentId: string) {
    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'COMPLETED' },
    });
  }

  async markNoShow(appointmentId: string) {
    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'NO_SHOW' },
    });
  }

  async getAllAppointments() {
    return this.prisma.appointment.findMany({
      include: {
        services: {
          include: {
            service: true,
          },
        },
        client: {
          include: {
            user: true,
          },
        },
        employee: {
          include: {
            user: true,
          },
        },
        payments: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }
}
