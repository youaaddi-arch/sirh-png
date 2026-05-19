import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TenantService } from './tenant.service';

@ApiTags('tenants')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('tenants')
export class TenantController {
  constructor(private service: TenantService) {}

  @Get()
  list() { return this.service.list(); }

  @Get(':id')
  get(@Param('id') id: string) { return this.service.get(id); }

  @Get(':id/convention')
  convention(@Param('id') id: string) { return this.service.getConvention(id); }

  @Post()
  create(@Body() body: any) { return this.service.create(body); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.service.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.delete(id); }
}
