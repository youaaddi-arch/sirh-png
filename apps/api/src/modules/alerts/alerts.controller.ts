import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';

@ApiTags('alerts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('alerts')
export class AlertsController {
  constructor(private service: AlertsService) {}

  @Get()
  list(@Query('managerId') managerId?: string, @Query('tenantId') tenantId?: string, @Query('role') role?: string) {
    return this.service.forUser({ managerId, tenantId, role });
  }
}
