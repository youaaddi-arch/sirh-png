import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { LeaveService } from './leave.service';
import { CreateLeaveDto, RejectLeaveDto } from './dto/leave.dto';

@ApiTags('leaves')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('leaves')
export class LeaveController {
  constructor(private service: LeaveService) {}

  @Get('types')
  types(@Query('tenantId') tenantId?: string) { return this.service.listTypes(tenantId); }

  @Get('holidays')
  holidays(@Query('year') year?: string) {
    return this.service.holidays(year ? +year : undefined);
  }

  @Get()
  list(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
    @Query('managerId') managerId?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.service.list({ employeeId, status, managerId, tenantId });
  }

  @Get('balance/:employeeId')
  balance(@Param('employeeId') employeeId: string, @Query('year') year?: string) {
    return this.service.getBalance(employeeId, year ? +year : undefined);
  }

  @Get(':id')
  get(@Param('id') id: string) { return this.service.get(id); }

  @Post()
  create(@Body() dto: CreateLeaveDto) { return this.service.create(dto); }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Req() req: Request) {
    return this.service.approve(id, (req.user as any).sub);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() dto: RejectLeaveDto, @Req() req: Request) {
    return this.service.reject(id, (req.user as any).sub, dto.reason);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Req() req: Request) {
    return this.service.cancel(id, (req.user as any).sub);
  }
}
