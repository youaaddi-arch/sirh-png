import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { OvertimeService } from './overtime.service';

@ApiTags('overtime')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('overtime-requests')
export class OvertimeController {
  constructor(private service: OvertimeService) {}

  @Get()
  list(@Query('employeeId') employeeId?: string, @Query('status') status?: string, @Query('managerId') managerId?: string) {
    return this.service.list({ employeeId, status, managerId });
  }

  @Post()
  create(@Body() data: any) { return this.service.create(data); }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Req() req: Request) {
    return this.service.approve(id, (req.user as any).sub);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() body: { reason?: string }, @Req() req: Request) {
    return this.service.reject(id, (req.user as any).sub, body.reason);
  }
}
