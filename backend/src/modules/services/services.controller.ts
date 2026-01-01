import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('test')
  testEndpoint() {
    return { message: 'Services endpoint is working', status: 'ok' };
  }

  @Get()
  async listServices() {
    return this.servicesService.getAllServices();
  }

  @Get('categories')
  async getCategories() {
    return this.servicesService.getAllCategories();
  }

  @Get(':id')
  async getService(@Param('id') id: string) {
    return this.servicesService.getServiceById(id);
  }

  @Post()
  async createService(@Body() data: any) {
    return this.servicesService.createService(data);
  }

  @Put(':id')
  async updateService(@Param('id') id: string, @Body() data: any) {
    return this.servicesService.updateService(id, data);
  }

  @Get(':category/:categoryId')
  async getServicesByCategory(@Param('categoryId') categoryId: string) {
    return this.servicesService.getServicesByCategory(categoryId);
  }
}
