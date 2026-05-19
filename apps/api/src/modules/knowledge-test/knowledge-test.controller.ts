import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { KnowledgeTestService } from './knowledge-test.service';

@ApiTags('knowledge-tests')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('knowledge-tests')
export class KnowledgeTestController {
  constructor(private service: KnowledgeTestService) {}

  @Get()
  list(@Query('category') category?: string) { return this.service.list(category); }

  @Get('attempts')
  allAttempts(@Query('tenantId') tenantId?: string) { return this.service.allAttempts(tenantId); }

  @Get('attempts/by-employee/:employeeId')
  myAttempts(@Param('employeeId') employeeId: string) { return this.service.myAttempts(employeeId); }

  @Get(':id')
  get(@Param('id') id: string) { return this.service.get(id); }

  @Post(':id/start')
  start(@Param('id') id: string, @Body() body: { employeeId: string }) {
    return this.service.start(id, body.employeeId);
  }

  @Post('attempts/:id/submit')
  submit(@Param('id') id: string, @Body() body: { answers: number[] }) {
    return this.service.submit(id, body.answers);
  }
}
