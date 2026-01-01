import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { AvailabilityService } from './availability.service';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get('test')
  testEndpoint() {
    return { message: 'Availability endpoint is working', status: 'ok' };
  }

  @Get('employee/:id')
  async getEmployeeAvailability(@Param('id') id: string) {
    return this.availabilityService.getAvailabilityRules(id);
  }

  @Post('rules')
  async createAvailabilityRule(@Body() data: any) {
    return this.availabilityService.createAvailabilityRule(data);
  }

  @Get('rules/employee/:id')
  async getAvailabilityRules(@Param('id') id: string) {
    return this.availabilityService.getAvailabilityRules(id);
  }

  @Put('rules/:id')
  async updateAvailabilityRule(@Param('id') id: string, @Body() data: any) {
    return this.availabilityService.updateAvailabilityRule(id, data);
  }

  @Delete('rules/:id')
  async deleteAvailabilityRule(@Param('id') id: string) {
    return this.availabilityService.deleteAvailabilityRule(id);
  }

  @Get('slots/employee/:id')
  async getAvailableSlots(@Param('id') id: string, @Body() data: any) {
    const date = new Date(data?.date || new Date());
    const duration = data?.duration || 15;
    return this.availabilityService.getAvailableSlots(id, date, duration);
  }
}
