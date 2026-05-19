import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';

@ApiTags('payroll')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('payroll')
export class PayrollController {
  constructor(private service: PayrollService) {}

  @Get('variables')
  @ApiOperation({ summary: 'Variables de paie mensuelles agrégées' })
  variables(@Query('month') month: string, @Query('tenantId') tenantId?: string) {
    return this.service.variables({ month, tenantId });
  }

  @Get('variables/extra')
  @ApiOperation({ summary: 'Primes et retenues du mois' })
  listVariables(@Query('month') month: string, @Query('employeeId') employeeId?: string) {
    return this.service.listVariablesForMonth(month, employeeId);
  }

  @Post('variables/extra')
  addVariable(@Body() data: any) {
    return this.service.addVariable(data);
  }

  @Delete('variables/extra/:id')
  deleteVariable(@Param('id') id: string) {
    return this.service.deleteVariable(id);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Génère les bulletins de paie du mois (simulés)' })
  generate(@Body() body: { month: string; tenantId?: string }) {
    return this.service.generatePayslips(body.month, body.tenantId);
  }

  @Get('payslips')
  payslips(@Query('employeeId') employeeId?: string, @Query('month') month?: string, @Query('tenantId') tenantId?: string) {
    return this.service.payslipsList({ employeeId, month, tenantId });
  }
}
