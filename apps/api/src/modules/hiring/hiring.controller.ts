import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HiringService } from './hiring.service';
import { AdvanceHireProcessDto, CreateHireProcessDto } from './dto/hiring.dto';
import { Request } from 'express';

@ApiTags('hiring')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('hire-processes')
export class HiringController {
  constructor(private service: HiringService) {}

  @Get()
  list(@Query('tenantId') tenantId?: string, @Query('status') status?: string) {
    return this.service.list({ tenantId, status });
  }

  @Get('stats')
  stats(@Query('tenantId') tenantId?: string) {
    return this.service.stats(tenantId);
  }

  @Get(':id')
  get(@Param('id') id: string) { return this.service.get(id); }

  @Post()
  @ApiOperation({ summary: 'Démarre un nouveau dossier d\'embauche (génère le lien candidat)' })
  create(@Body() dto: CreateHireProcessDto, @Req() req: Request) {
    const userId = (req.user as any).sub;
    return this.service.create(dto, userId);
  }

  @Patch(':id/advance')
  @ApiOperation({ summary: 'Avance le dossier au statut suivant (validation, contrat, embauche)' })
  advance(@Param('id') id: string, @Body() dto: AdvanceHireProcessDto, @Req() req: Request) {
    const userId = (req.user as any).sub;
    return this.service.advance(id, dto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.delete(id); }
}
