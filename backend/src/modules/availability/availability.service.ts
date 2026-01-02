import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async getAvailabilityRules(employeeId: string) {
    return this.prisma.availabilityRule.findMany({
      where: { employeeId },
    });
  }

  async createAvailabilityRule(data: any) {
    return this.prisma.availabilityRule.create({
      data,
    });
  }

  async updateAvailabilityRule(ruleId: string, data: any) {
    return this.prisma.availabilityRule.update({
      where: { id: ruleId },
      data,
    });
  }

  async deleteAvailabilityRule(ruleId: string) {
    return this.prisma.availabilityRule.delete({
      where: { id: ruleId },
    });
  }

  /**
   * Check availability for an employee on a specific date/time
   * Takes into account weekly rules and exceptions
   */
  async checkAvailability(
    employeeId: string,
    startTime: Date | string,
    endTime: Date | string,
  ): Promise<boolean> {
    // Convert to Date objects if they're strings
    const startTimeDate = typeof startTime === 'string' ? new Date(startTime) : startTime;
    const endTimeDate = typeof endTime === 'string' ? new Date(endTime) : endTime;

    const dayOfWeek = startTimeDate.getDay();
    const startTimeStr = startTimeDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const endTimeStr = endTimeDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    // Check for exception rules first
    const exceptionRule = await this.prisma.availabilityRule.findFirst({
      where: {
        employeeId,
        isException: true,
        exceptionDate: {
          gte: new Date(startTimeDate.getFullYear(), startTimeDate.getMonth(), startTimeDate.getDate()),
          lt: new Date(startTimeDate.getFullYear(), startTimeDate.getMonth(), startTimeDate.getDate() + 1),
        },
      },
    });

    if (exceptionRule) {
      return startTimeStr >= exceptionRule.startTime && endTimeStr <= exceptionRule.endTime;
    }

    // Check weekly availability rules
    const weeklyRule = await this.prisma.availabilityRule.findFirst({
      where: {
        employeeId,
        dayOfWeek,
        isException: false,
      },
    });

    if (!weeklyRule) {
      return false;
    }

    return startTimeStr >= weeklyRule.startTime && endTimeStr <= weeklyRule.endTime;
  }

  /**
   * Get available time slots for an employee on a specific date
   * Excludes slots that have existing appointments
   */
  async getAvailableSlots(
    employeeId: string,
    date: Date,
    slotDurationMinutes: number = 15,
  ) {
    const dayOfWeek = date.getDay();
    const slots: { start: string; end: string; isNextAvailable?: boolean }[] = [];

    // Get availability rules for this day
    const rules = await this.prisma.availabilityRule.findMany({
      where: {
        employeeId,
        OR: [
          { dayOfWeek, isException: false },
          {
            isException: true,
            exceptionDate: {
              gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
              lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
            },
          },
        ],
      },
    });

    if (rules.length === 0) {
      return slots;
    }

    const rule = rules[0];
    const [startHour, startMin] = rule.startTime.split(':').map(Number);
    const [endHour, endMin] = rule.endTime.split(':').map(Number);

    // Fetch all appointments for this employee on this date
    const appointments = await this.prisma.appointment.findMany({
      where: {
        employeeId,
        startTime: {
          gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
        },
      },
    });

    let currentTime = new Date(date);
    currentTime.setHours(startHour, startMin, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(endHour, endMin, 0, 0);

    let isFirstAvailable = true;
    const now = new Date();

    while (currentTime < endTime) {
      const slotEnd = new Date(currentTime.getTime() + slotDurationMinutes * 60000);
      if (slotEnd <= endTime) {
        // Check if this slot conflicts with any appointment
        const isBooked = appointments.some(
          (apt) =>
            (currentTime >= apt.startTime && currentTime < apt.endTime) ||
            (slotEnd > apt.startTime && slotEnd <= apt.endTime) ||
            (currentTime <= apt.startTime && slotEnd >= apt.endTime),
        );

        if (!isBooked) {
          const slotObj: any = {
            start: currentTime.toISOString(),
            end: slotEnd.toISOString(),
          };

          // Mark the first available slot (in the future)
          if (isFirstAvailable && slotEnd > now) {
            slotObj.isNextAvailable = true;
            isFirstAvailable = false;
          }

          slots.push(slotObj);
        }
      }
      currentTime = slotEnd;
    }

    return slots;
  }
}
