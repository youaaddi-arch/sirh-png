import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { TimesheetService } from './timesheet.service';

@ApiTags('timesheets')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('timesheets')
export class TimesheetController {
  constructor(private service: TimesheetService) {}

  @Get()
  list(@Query('employeeId') employeeId?: string, @Query('from') from?: string, @Query('to') to?: string) {
    return this.service.list({ employeeId, from, to });
  }

  @Post('clock/:employeeId')
  clock(@Param('employeeId') employeeId: string) { return this.service.clock(employeeId); }

  @Post('day/:employeeId')
  upsertDay(@Param('employeeId') employeeId: string, @Body() data: any) {
    return this.service.upsertDay(employeeId, data);
  }

  @Patch(':id/validate')
  validate(@Param('id') id: string, @Req() req: Request) {
    return this.service.validate(id, (req.user as any).sub);
  }
}
