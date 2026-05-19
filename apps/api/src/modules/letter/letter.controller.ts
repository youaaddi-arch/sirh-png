import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { LetterService } from './letter.service';
import { CreateLetterDto } from './dto/letter.dto';

@ApiTags('letters')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('letters')
export class LetterController {
  constructor(private service: LetterService) {}

  @Get()
  list(@Query('tenantId') tenantId?: string, @Query('employeeId') employeeId?: string, @Query('type') type?: string) {
    return this.service.list({ tenantId, employeeId, type });
  }

  @Get('templates')
  @ApiOperation({ summary: 'Liste des modèles de courriers RH' })
  templates() { return this.service.templates(); }

  @Get(':id')
  get(@Param('id') id: string) { return this.service.get(id); }

  @Post()
  @ApiOperation({ summary: 'Génère un courrier depuis un template' })
  create(@Body() dto: CreateLetterDto, @Req() req: Request) {
    return this.service.create(dto, (req.user as any).sub);
  }

  @Patch(':id/sent')
  markSent(@Param('id') id: string, @Body() body: { recipientEmail?: string } = {}) {
    return this.service.markSent(id, body.recipientEmail);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.delete(id); }
}
