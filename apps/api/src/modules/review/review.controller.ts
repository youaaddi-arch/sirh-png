import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReviewService } from './review.service';

@ApiTags('reviews')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('reviews')
export class ReviewController {
  constructor(private service: ReviewService) {}

  @Get('templates')
  templates() { return this.service.templates(); }

  @Get('templates/:type')
  template(@Param('type') type: string) { return this.service.template(type); }

  @Get()
  list(@Query('employeeId') employeeId?: string, @Query('reviewerId') reviewerId?: string, @Query('status') status?: string, @Query('tenantId') tenantId?: string) {
    return this.service.list({ employeeId, reviewerId, status, tenantId });
  }

  @Get(':id')
  get(@Param('id') id: string) { return this.service.get(id); }

  @Post()
  schedule(@Body() data: any) { return this.service.schedule(data); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }

  @Patch(':id/complete')
  complete(@Param('id') id: string) { return this.service.complete(id); }

  @Patch(':id/sign/:role')
  sign(@Param('id') id: string, @Param('role') role: 'employee' | 'reviewer') {
    return this.service.sign(id, role);
  }

  // Goals
  @Get('goals/by-employee/:employeeId')
  goals(@Param('employeeId') employeeId: string) { return this.service.goalsForEmployee(employeeId); }

  @Post('goals')
  createGoal(@Body() data: any) { return this.service.createGoal(data); }

  @Patch('goals/:id')
  updateGoal(@Param('id') id: string, @Body() data: any) { return this.service.updateGoal(id, data); }

  @Delete('goals/:id')
  deleteGoal(@Param('id') id: string) { return this.service.deleteGoal(id); }
}
