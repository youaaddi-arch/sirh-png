import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';

@ApiTags('tenants')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('tenants')
export class TenantController {
  constructor(private service: TenantService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des sociétés visibles par l\'utilisateur' })
  list(@Query('active') active?: string, @Query('type') type?: string) {
    return this.service.list({
      active: active === undefined ? undefined : active === 'true',
      type: type || undefined,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) { return this.service.get(id); }

  @Get(':id/convention')
  @ApiOperation({ summary: 'Convention collective applicable à la société' })
  convention(@Param('id') id: string) { return this.service.getConvention(id); }

  @Post(':id/convention/sync')
  @ApiOperation({ summary: 'Resynchronise la convention depuis Légifrance' })
  syncConvention(@Param('id') id: string) { return this.service.syncConvention(id); }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Statistiques de la société (effectif, départements)' })
  stats(@Param('id') id: string) { return this.service.stats(id); }

  @Post()
  create(@Body() dto: CreateTenantDto) { return this.service.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.delete(id); }
}
