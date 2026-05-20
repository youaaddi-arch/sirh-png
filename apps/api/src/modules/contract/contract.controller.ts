import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ContractService } from './contract.service';
import { GenerateFromHireDto, SignContractDto } from './dto/contract.dto';

@ApiTags('contracts')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('contracts')
export class ContractController {
  constructor(private service: ContractService) {}

  @Get()
  list(@Query('tenantId') tenantId?: string, @Query('employeeId') employeeId?: string, @Query('status') status?: string) {
    return this.service.list({ tenantId, employeeId, status });
  }

  @Get(':id')
  get(@Param('id') id: string) { return this.service.get(id); }

  @Post('generate-from-hire')
  @ApiOperation({ summary: 'Génère un contrat depuis un dossier d\'embauche via IA Claude (ou template fallback)' })
  generateFromHire(@Body() dto: GenerateFromHireDto, @Req() req: Request) {
    return this.service.generateFromHire(dto.hireProcessId, (req.user as any).sub);
  }

  @Post('generate-for-employee/:employeeId')
  @ApiOperation({ summary: 'Génère un nouveau contrat pour un salarié existant (avenant, renouvellement)' })
  generateForEmployee(@Param('employeeId') employeeId: string, @Req() req: Request) {
    return this.service.generateForEmployee(employeeId, (req.user as any).sub);
  }

  @Post(':id/send')
  @ApiOperation({ summary: 'Envoie le contrat pour signature (e-signature mock en MVP)' })
  send(@Param('id') id: string) { return this.service.send(id); }

  @Post(':id/sign')
  @ApiOperation({ summary: 'Signe le contrat (par employé ou employeur)' })
  sign(@Param('id') id: string, @Body() dto: SignContractDto, @Req() req: Request) {
    return this.service.sign(id, dto, req.ip);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.delete(id); }
}
