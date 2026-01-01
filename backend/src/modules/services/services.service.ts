import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllServices(isActive = true) {
    return this.prisma.service.findMany({
      where: { isActive },
      include: {
        category: true,
      },
    });
  }

  async getServiceById(serviceId: string) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        category: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  async getServicesByCategory(categoryId: string) {
    return this.prisma.service.findMany({
      where: {
        categoryId,
        isActive: true,
      },
    });
  }

  async getAllCategories() {
    return this.prisma.serviceCategory.findMany();
  }

  async createService(data: any) {
    return this.prisma.service.create({
      data,
      include: {
        category: true,
      },
    });
  }

  async updateService(serviceId: string, data: any) {
    return this.prisma.service.update({
      where: { id: serviceId },
      data,
      include: {
        category: true,
      },
    });
  }
}
