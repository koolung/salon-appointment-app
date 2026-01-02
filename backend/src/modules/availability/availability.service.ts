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

    // Use UTC time for consistency
    const dayOfWeek = startTimeDate.getUTCDay();
    const startTimeStr = `${String(startTimeDate.getUTCHours()).padStart(2, '0')}:${String(startTimeDate.getUTCMinutes()).padStart(2, '0')}`;
    const endTimeStr = `${String(endTimeDate.getUTCHours()).padStart(2, '0')}:${String(endTimeDate.getUTCMinutes()).padStart(2, '0')}`;

    // Check for exception rules first
    const exceptionRule = await this.prisma.availabilityRule.findFirst({
      where: {
        employeeId,
        isException: true,
        exceptionDate: {
          gte: new Date(Date.UTC(startTimeDate.getUTCFullYear(), startTimeDate.getUTCMonth(), startTimeDate.getUTCDate())),
          lt: new Date(Date.UTC(startTimeDate.getUTCFullYear(), startTimeDate.getUTCMonth(), startTimeDate.getUTCDate() + 1)),
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
    const dayOfWeek = date.getUTCDay();
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
              gte: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())),
              lt: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1)),
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
          gte: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())),
          lt: new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1)),
        },
      },
    });

    let currentTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), startHour, startMin, 0, 0));
    const endTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), endHour, endMin, 0, 0));

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

  /**
   * Get working hours for an employee on a specific date
   * Returns the startTime and endTime based on availability rules
   * Returns null if employee has a full day off (00:00 - 00:00)
   */
  async getWorkingHours(employeeId: string, date: Date | string) {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const dayOfWeek = dateObj.getUTCDay();

    // Check for exception rules first
    const exceptionRule = await this.prisma.availabilityRule.findFirst({
      where: {
        employeeId,
        isException: true,
        exceptionDate: {
          gte: new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate())),
          lt: new Date(Date.UTC(dateObj.getUTCFullYear(), dateObj.getUTCMonth(), dateObj.getUTCDate() + 1)),
        },
      },
    });

    if (exceptionRule) {
      // Check if it's a full-day-off (00:00 - 00:00)
      if (exceptionRule.startTime === '00:00' && exceptionRule.endTime === '00:00') {
        return null; // Full day off - no availability
      }
      
      return {
        startTime: exceptionRule.startTime,
        endTime: exceptionRule.endTime,
        isException: true,
      };
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
      return null; // No availability for this day
    }

    return {
      startTime: weeklyRule.startTime,
      endTime: weeklyRule.endTime,
      isException: false,
    };
  }
}
