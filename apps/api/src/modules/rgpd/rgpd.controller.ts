import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RgpdService } from './rgpd.service';

@ApiTags('rgpd')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('rgpd')
export class RgpdController {
  constructor(private service: RgpdService) {}

  @Get('activities')
  @ApiOperation({ summary: 'Registre des traitements (art. 30 RGPD)' })
  activities(@Query('tenantId') tenantId?: string) { return this.service.listActivities(tenantId); }

  @Post('activities')
  createActivity(@Body() data: any) { return this.service.createActivity(data); }

  @Patch('activities/:id')
  updateActivity(@Param('id') id: string, @Body() data: any) { return this.service.updateActivity(id, data); }

  @Delete('activities/:id')
  deleteActivity(@Param('id') id: string) { return this.service.deleteActivity(id); }

  @Get('audit')
  @ApiOperation({ summary: 'Journal d\'audit (qui a vu/modifié quoi)' })
  audit(@Query('tenantId') tenantId?: string, @Query('userId') userId?: string, @Query('entityType') entityType?: string) {
    return this.service.auditLog({ tenantId, userId, entityType });
  }

  @Get('export/:employeeId')
  @ApiOperation({ summary: 'Export complet du dossier (art. 20 — portabilité)' })
  exportEmployee(@Param('employeeId') employeeId: string) {
    return this.service.exportEmployeeData(employeeId);
  }

  @Post('delete/:employeeId')
  @ApiOperation({ summary: 'Droit à l\'oubli (art. 17) — anonymise le salarié, conserve docs légaux' })
  deleteEmployee(@Param('employeeId') employeeId: string, @Body() body: { reason: string }) {
    return this.service.deleteEmployeeData(employeeId, body.reason);
  }

  @Get('export-requests')
  exportRequests() { return this.service.listExportRequests(); }

  @Post('consent')
  recordConsent(@Body() data: any) { return this.service.recordConsent(data); }

  @Get('consents/:employeeId')
  consents(@Param('employeeId') employeeId: string) { return this.service.consentsForEmployee(employeeId); }
}
