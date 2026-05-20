import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ExpenseService } from './expense.service';

@ApiTags('expenses')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('expense-reports')
export class ExpenseController {
  constructor(private service: ExpenseService) {}

  @Get()
  list(@Query('employeeId') employeeId?: string, @Query('status') status?: string, @Query('managerId') managerId?: string) {
    return this.service.list({ employeeId, status, managerId });
  }

  @Get(':id')
  get(@Param('id') id: string) { return this.service.get(id); }

  @Post()
  create(@Body() data: any) { return this.service.createReport(data); }

  @Post(':id/lines')
  addLine(@Param('id') id: string, @Body() data: any) { return this.service.addLine(id, data); }

  @Delete('lines/:lineId')
  deleteLine(@Param('lineId') lineId: string) { return this.service.deleteLine(lineId); }

  @Post('lines/:lineId/receipt')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  uploadReceipt(@Param('lineId') lineId: string, @UploadedFile() file: Express.Multer.File) {
    return this.service.uploadReceipt(lineId, {
      originalname: file.originalname, buffer: file.buffer, mimetype: file.mimetype, size: file.size,
    });
  }

  @Patch(':id/submit')
  submit(@Param('id') id: string) { return this.service.submit(id); }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Req() req: Request) {
    return this.service.approve(id, (req.user as any).sub);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() body: { reason?: string }, @Req() req: Request) {
    return this.service.reject(id, (req.user as any).sub, body.reason);
  }

  @Patch(':id/reimburse')
  reimburse(@Param('id') id: string) { return this.service.reimburse(id); }
}
