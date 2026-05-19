import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StorageService } from '../../integrations/storage/storage.service';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService, private storage: StorageService) {}

  list(filters: { employeeId?: string; status?: string; managerId?: string } = {}) {
    const where: any = {};
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.status) where.status = filters.status;
    if (filters.managerId) where.employee = { managerId: filters.managerId };
    return this.prisma.expenseReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        lines: true,
      },
    });
  }

  async get(id: string) {
    const r = await this.prisma.expenseReport.findUnique({
      where: { id }, include: { employee: true, lines: { orderBy: { date: 'desc' } } },
    });
    if (!r) throw new NotFoundException('Note de frais introuvable');
    return r;
  }

  createReport(data: { employeeId: string; periodMonth: string }) {
    return this.prisma.expenseReport.create({
      data: { ...data, status: 'brouillon', totalAmount: 0 },
    });
  }

  async addLine(reportId: string, data: { date: string; category: string; amount: number; description?: string; project?: string; vatAmount?: number }) {
    const report = await this.prisma.expenseReport.findUnique({ where: { id: reportId } });
    if (!report) throw new NotFoundException('Note introuvable');
    if (report.status !== 'brouillon') throw new BadRequestException('Note déjà soumise — impossible d\'ajouter une ligne');

    const line = await this.prisma.expenseLine.create({
      data: { ...data, reportId, date: new Date(data.date), amount: Number(data.amount) },
    });
    await this.recomputeTotal(reportId);
    return line;
  }

  async deleteLine(lineId: string) {
    const line = await this.prisma.expenseLine.findUnique({ where: { id: lineId } });
    if (!line) throw new NotFoundException('Ligne introuvable');
    await this.prisma.expenseLine.delete({ where: { id: lineId } });
    await this.recomputeTotal(line.reportId);
    return { ok: true };
  }

  async uploadReceipt(lineId: string, file: { originalname: string; buffer: Buffer; mimetype: string; size: number }) {
    if (file.size > 5 * 1024 * 1024) throw new BadRequestException('Fichier > 5 Mo');
    const { path } = await this.storage.upload('sirh-documents', file.originalname, file.buffer);
    return this.prisma.expenseLine.update({ where: { id: lineId }, data: { receiptPath: path } });
  }

  async submit(id: string) {
    const r = await this.get(id);
    if (r.lines.length === 0) throw new BadRequestException('Note vide');
    if (r.status !== 'brouillon') throw new BadRequestException('Déjà soumise');
    return this.prisma.expenseReport.update({
      where: { id }, data: { status: 'soumis', submittedAt: new Date() },
    });
  }

  async approve(id: string, approvedById: string) {
    const r = await this.get(id);
    if (r.status !== 'soumis') throw new BadRequestException('La note doit être soumise');
    return this.prisma.expenseReport.update({
      where: { id }, data: { status: 'approuve', approvedById, approvedAt: new Date() },
    });
  }

  async reject(id: string, approvedById: string, reason?: string) {
    return this.prisma.expenseReport.update({
      where: { id }, data: { status: 'refuse', approvedById, approvedAt: new Date(), rejectReason: reason },
    });
  }

  async reimburse(id: string) {
    return this.prisma.expenseReport.update({
      where: { id }, data: { status: 'rembourse', paidAt: new Date() },
    });
  }

  private async recomputeTotal(reportId: string) {
    const sum = await this.prisma.expenseLine.aggregate({
      _sum: { amount: true }, where: { reportId },
    });
    await this.prisma.expenseReport.update({
      where: { id: reportId }, data: { totalAmount: sum._sum.amount || 0 },
    });
  }
}
