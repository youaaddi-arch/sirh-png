import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TeamService } from './team.service';

@ApiTags('team')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('team')
export class TeamController {
  constructor(private service: TeamService) {}

  @Get('stats')
  @ApiOperation({ summary: 'KPIs équipe : effectif, absences, validations à faire, anniversaires…' })
  stats(@Query('managerId') managerId?: string, @Query('tenantId') tenantId?: string) {
    return this.service.stats({ managerId, tenantId });
  }

  @Get('pending')
  @ApiOperation({ summary: 'Toutes les validations en attente (congés + heures sup + frais)' })
  pending(@Query('managerId') managerId?: string, @Query('tenantId') tenantId?: string) {
    return this.service.pendingFor({ managerId, tenantId });
  }

  @Get('planning')
  @ApiOperation({ summary: 'Planning équipe : qui est absent quand sur la période' })
  planning(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('managerId') managerId?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.service.planning({ from, to, managerId, tenantId });
  }

  @Get('birthdays')
  @ApiOperation({ summary: 'Anniversaires du mois' })
  birthdays(
    @Query('managerId') managerId?: string,
    @Query('tenantId') tenantId?: string,
    @Query('month') month?: string,
  ) {
    return this.service.birthdays({ managerId, tenantId, month: month ? +month : undefined });
  }

  @Get('members/:managerId')
  @ApiOperation({ summary: 'Membres directs d\'un manager' })
  members(@Query('managerId') managerId: string) {
    return this.service.team(managerId);
  }
}
