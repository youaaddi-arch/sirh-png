import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';

@ApiTags('employees')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('employees')
export class EmployeeController {
  constructor(private service: EmployeeService) {}

  @Get()
  list(@Query('tenantId') tenantId?: string, @Query('status') status?: string, @Query('departmentId') departmentId?: string) {
    return this.service.list({ tenantId, status, departmentId });
  }

  @Get(':id')
  get(@Param('id') id: string) { return this.service.get(id); }

  @Post()
  create(@Body() body: any) { return this.service.create(body); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.delete(id); }
}
