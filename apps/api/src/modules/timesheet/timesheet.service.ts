import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class TimesheetService {
  constructor(private prisma: PrismaService) {}

  list(filters: { employeeId?: string; from?: string; to?: string }) {
    const where: any = {};
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.from || filters.to) {
      where.date = {};
      if (filters.from) where.date.gte = new Date(filters.from);
      if (filters.to) where.date.lte = new Date(filters.to);
    }
    return this.prisma.timesheet.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { employee: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  /**
   * Pointage : clock-in / clock-out
   */
  async clock(employeeId: string) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const existing = await this.prisma.timesheet.findUnique({
      where: { employeeId_date: { employeeId, date: today } },
    });
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (!existing) {
      return this.prisma.timesheet.create({
        data: { employeeId, date: today, startTime: time, status: 'en_attente' },
      });
    }
    if (!existing.endTime) {
      const [sh, sm] = existing.startTime!.split(':').map(Number);
      const [eh, em] = time.split(':').map(Number);
      const mins = (eh * 60 + em) - (sh * 60 + sm) - (existing.breakMinutes || 0);
      const hours = Math.max(0, mins / 60);
      return this.prisma.timesheet.update({
        where: { id: existing.id },
        data: { endTime: time, hoursWorked: hours },
      });
    }
    return existing;
  }

  async upsertDay(employeeId: string, data: { date: string; startTime?: string; endTime?: string; breakMinutes?: number; project?: string; notes?: string }) {
    const date = new Date(data.date); date.setHours(0, 0, 0, 0);
    let hours = 0;
    if (data.startTime && data.endTime) {
      const [sh, sm] = data.startTime.split(':').map(Number);
      const [eh, em] = data.endTime.split(':').map(Number);
      hours = Math.max(0, ((eh * 60 + em) - (sh * 60 + sm) - (data.breakMinutes || 0)) / 60);
    }
    return this.prisma.timesheet.upsert({
      where: { employeeId_date: { employeeId, date } },
      create: { employeeId, date, ...data, hoursWorked: hours, status: 'en_attente' },
      update: { ...data, hoursWorked: hours },
    });
  }

  async validate(id: string, validatedById: string) {
    const t = await this.prisma.timesheet.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Pointage introuvable');
    return this.prisma.timesheet.update({
      where: { id },
      data: { status: 'valide', validatedById, validatedAt: new Date() },
    });
  }
}
