import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayment(data: {
    appointmentId: string;
    amount: number;
    method: 'CASH' | 'CARD' | 'ONLINE';
    stripeId?: string;
  }) {
    return this.prisma.payment.create({
      data: {
        appointmentId: data.appointmentId,
        amount: data.amount,
        method: data.method,
        stripeId: data.stripeId,
        status: 'PENDING',
      },
    });
  }

  async getPayment(paymentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async getPaymentsByAppointment(appointmentId: string) {
    return this.prisma.payment.findMany({
      where: { appointmentId },
    });
  }

  async completePayment(paymentId: string) {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'COMPLETED' },
    });
  }

  async failPayment(paymentId: string) {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'FAILED' },
    });
  }

  async refundPayment(paymentId: string) {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: 'REFUNDED' },
    });
  }
}
