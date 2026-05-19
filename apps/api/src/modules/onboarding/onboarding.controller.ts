import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { OnboardingService } from './onboarding.service';
import { ONBOARDING_TEMPLATES, pickTemplate } from './onboarding-templates';

@ApiTags('onboarding')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('onboarding')
export class OnboardingController {
  constructor(private service: OnboardingService) {}

  @Get()
  list(@Query('tenantId') tenantId?: string, @Query('status') status?: string) {
    return this.service.list({ tenantId, status });
  }

  @Get('templates')
  @ApiOperation({ summary: 'Liste des templates d\'onboarding par poste' })
  templates() {
    return ONBOARDING_TEMPLATES.map((t) => ({
      name: t.name,
      appliesTo: t.appliesTo.map((r) => r.source),
      taskCount: t.tasks.length,
      tasks: t.tasks,
    }));
  }

  @Get('templates/preview/:jobTitle')
  @ApiOperation({ summary: 'Aperçu du template qui serait appliqué à un jobTitle donné' })
  preview(@Param('jobTitle') jobTitle: string) {
    return pickTemplate(decodeURIComponent(jobTitle));
  }

  @Get(':id')
  get(@Param('id') id: string) { return this.service.get(id); }

  @Get('by-employee/:employeeId')
  byEmployee(@Param('employeeId') employeeId: string) {
    return this.service.getByEmployee(employeeId);
  }

  @Post('start/:employeeId')
  @ApiOperation({ summary: 'Démarre manuellement un onboarding pour un salarié' })
  start(@Param('employeeId') employeeId: string) {
    return this.service.createForEmployee(employeeId);
  }

  @Post('provision/:employeeId')
  @ApiOperation({ summary: 'Provisioning complet : compte + email + courriers + onboarding' })
  provision(@Param('employeeId') employeeId: string, @Req() req: Request) {
    return this.service.provisionAfterSignature(employeeId, (req.user as any).sub);
  }

  @Patch(':id/tasks/:taskId')
  @ApiOperation({ summary: 'Marque une tâche d\'onboarding comme faite (ou la décoche)' })
  toggleTask(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() body: { done: boolean },
    @Req() req: Request,
  ) {
    return this.service.toggleTask(id, taskId, body.done, (req.user as any).sub);
  }
}
