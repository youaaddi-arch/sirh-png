import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { LegifranceService } from './legifrance.service';

@ApiTags('conventions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('conventions')
export class LegifranceController {
  constructor(private service: LegifranceService) {}

  @Get()
  @ApiOperation({ summary: 'Liste toutes les conventions collectives' })
  list() { return this.service.list(); }

  @Get(':code')
  @ApiOperation({ summary: 'Détail d\'une convention par code IDCC' })
  get(@Param('code') code: string) { return this.service.get(code); }

  @Post('sync')
  @ApiOperation({ summary: 'Synchronise toutes les conventions depuis le référentiel (et Légifrance si configuré)' })
  syncAll() { return this.service.syncAll(); }

  @Post(':code/sync')
  @ApiOperation({ summary: 'Synchronise une convention spécifique' })
  syncOne(@Param('code') code: string) { return this.service.syncOne(code); }
}
