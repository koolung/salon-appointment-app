import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { EmployeesService } from './employees.service';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get('test')
  testEndpoint() {
    return { message: 'Employees endpoint is working', status: 'ok' };
  }

  @Get()
  async listEmployees() {
    return this.employeesService.getAllEmployees();
  }

  @Get(':id')
  async getEmployee(@Param('id') id: string) {
    return this.employeesService.getEmployeeById(id);
  }

  @Put(':id')
  async updateEmployee(@Param('id') id: string, @Body() data: any) {
    return this.employeesService.updateEmployee(id, data);
  }

  @Get(':id/performance')
  async getPerformance(@Param('id') id: string) {
    return this.employeesService.getEmployeePerformance(id);
  }
}
