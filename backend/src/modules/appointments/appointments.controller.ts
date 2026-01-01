import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('test')
  testEndpoint() {
    return { message: 'Appointments endpoint is working', status: 'ok' };
  }

  @Post()
  async createAppointment(@Body() data: any, @Request() req: any) {
    return this.appointmentsService.createAppointment(data);
  }

  @Get('my')
  async getMyAppointments(@Request() req: any) {
    // Get appointments for logged-in user
    return this.appointmentsService.getAppointmentsByClient(req.user?.sub);
  }

  @Get(':id')
  async getAppointment(@Param('id') id: string) {
    return this.appointmentsService.getAppointment(id);
  }

  @Put(':id')
  async rescheduleAppointment(@Param('id') id: string, @Body() data: any) {
    return this.appointmentsService.rescheduleAppointment(
      id,
      new Date(data.newStartTime),
      new Date(data.newEndTime),
    );
  }

  @Delete(':id')
  async cancelAppointment(@Param('id') id: string) {
    return this.appointmentsService.cancelAppointment(id);
  }

  @Post(':id/confirm')
  async confirmAppointment(@Param('id') id: string) {
    return this.appointmentsService.confirmAppointment(id);
  }
}
