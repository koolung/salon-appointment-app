import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly prisma: PrismaService) {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '1025'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'test',
        pass: process.env.SMTP_PASSWORD || 'test',
      },
    });
  }

  async sendBookingConfirmation(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
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
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!appointment) {
      return;
    }

    const subject = 'Booking Confirmation';
    const html = `
      <h2>Booking Confirmed!</h2>
      <p>Hi ${appointment.client.user.firstName},</p>
      <p>Your booking has been confirmed.</p>
      <h3>Appointment Details:</h3>
      <ul>
        <li><strong>Date:</strong> ${appointment.startTime.toLocaleDateString()}</li>
        <li><strong>Time:</strong> ${appointment.startTime.toLocaleTimeString()} - ${appointment.endTime.toLocaleTimeString()}</li>
        <li><strong>Stylist:</strong> ${appointment.employee.user.firstName} ${appointment.employee.user.lastName}</li>
        <li><strong>Services:</strong> ${appointment.services.map((s) => s.service.name).join(', ')}</li>
      </ul>
      <p>Thank you for booking with us!</p>
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: appointment.client.user.email,
      subject,
      html,
    });
  }

  async sendBookingModification(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: {
          include: {
            user: true,
          },
        },
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!appointment) {
      return;
    }

    const subject = 'Booking Rescheduled';
    const html = `
      <h2>Your booking has been rescheduled</h2>
      <p>Hi ${appointment.client.user.firstName},</p>
      <p>Your appointment has been rescheduled to:</p>
      <h3>New Appointment Details:</h3>
      <ul>
        <li><strong>Date:</strong> ${appointment.startTime.toLocaleDateString()}</li>
        <li><strong>Time:</strong> ${appointment.startTime.toLocaleTimeString()} - ${appointment.endTime.toLocaleTimeString()}</li>
        <li><strong>Services:</strong> ${appointment.services.map((s) => s.service.name).join(', ')}</li>
      </ul>
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: appointment.client.user.email,
      subject,
      html,
    });
  }

  async sendBookingCancellation(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        client: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!appointment) {
      return;
    }

    const subject = 'Booking Cancelled';
    const html = `
      <h2>Your booking has been cancelled</h2>
      <p>Hi ${appointment.client.user.firstName},</p>
      <p>Your appointment scheduled for ${appointment.startTime.toLocaleDateString()} at ${appointment.startTime.toLocaleTimeString()} has been cancelled.</p>
      <p>If you have any questions, please contact us.</p>
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: appointment.client.user.email,
      subject,
      html,
    });
  }

  async sendReminderNotification(appointmentId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
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
        services: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!appointment) {
      return;
    }

    const subject = 'Appointment Reminder';
    const html = `
      <h2>Your appointment is coming up!</h2>
      <p>Hi ${appointment.client.user.firstName},</p>
      <p>This is a reminder about your appointment.</p>
      <h3>Appointment Details:</h3>
      <ul>
        <li><strong>Date:</strong> ${appointment.startTime.toLocaleDateString()}</li>
        <li><strong>Time:</strong> ${appointment.startTime.toLocaleTimeString()}</li>
        <li><strong>Stylist:</strong> ${appointment.employee.user.firstName} ${appointment.employee.user.lastName}</li>
        <li><strong>Services:</strong> ${appointment.services.map((s) => s.service.name).join(', ')}</li>
      </ul>
      <p>See you soon!</p>
    `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: appointment.client.user.email,
      subject,
      html,
    });
  }
}
