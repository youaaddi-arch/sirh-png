import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { REVIEW_TEMPLATES, getTemplate } from './review-templates';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  list(filters: { employeeId?: string; reviewerId?: string; status?: string; tenantId?: string } = {}) {
    const where: any = {};
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.reviewerId) where.reviewerId = filters.reviewerId;
    if (filters.status) where.status = filters.status;
    if (filters.tenantId) where.employee = { tenantId: filters.tenantId };
    return this.prisma.review.findMany({
      where,
      orderBy: { scheduledAt: 'desc' },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, jobTitle: true, tenantId: true } },
        reviewer: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async get(id: string) {
    const r = await this.prisma.review.findUnique({
      where: { id },
      include: {
        employee: true,
        reviewer: { select: { id: true, firstName: true, lastName: true } },
        goals: true,
      },
    });
    if (!r) throw new NotFoundException('Entretien introuvable');
    return r;
  }

  templates() { return REVIEW_TEMPLATES; }
  template(type: string) {
    const t = getTemplate(type);
    if (!t) throw new BadRequestException(`Type ${type} inconnu`);
    return t;
  }

  schedule(data: { employeeId: string; reviewerId: string; type: string; scheduledAt: string; periodStart?: string; periodEnd?: string }) {
    const tpl = getTemplate(data.type);
    if (!tpl) throw new BadRequestException(`Type ${data.type} inconnu`);
    const formData = {
      sections: tpl.sections.map((s) => ({
        title: s.title,
        questions: s.questions.map((q) => ({ ...q, answer: '' })),
      })),
    };
    return this.prisma.review.create({
      data: {
        ...data,
        scheduledAt: new Date(data.scheduledAt),
        periodStart: data.periodStart ? new Date(data.periodStart) : undefined,
        periodEnd: data.periodEnd ? new Date(data.periodEnd) : undefined,
        formData,
        status: 'planifie',
      },
    });
  }

  async update(id: string, data: Partial<{ formData: any; overallRating: number; strengths: string; improvements: string; comments: string; status: string }>) {
    return this.prisma.review.update({ where: { id }, data: data as any });
  }

  async complete(id: string) {
    return this.prisma.review.update({
      where: { id },
      data: { status: 'realise', completedAt: new Date() },
    });
  }

  async sign(id: string, role: 'employee' | 'reviewer') {
    const field = role === 'employee' ? 'signedEmployeeAt' : 'signedReviewerAt';
    const updated = await this.prisma.review.update({
      where: { id }, data: { [field]: new Date() } as any,
    });
    if (updated.signedEmployeeAt && updated.signedReviewerAt) {
      return this.prisma.review.update({ where: { id }, data: { status: 'signe' } });
    }
    return updated;
  }

  // Goals
  goalsForEmployee(employeeId: string) {
    return this.prisma.goal.findMany({ where: { employeeId }, orderBy: { createdAt: 'desc' } });
  }

  createGoal(data: { employeeId: string; reviewId?: string; title: string; description?: string; targetDate?: string }) {
    return this.prisma.goal.create({
      data: { ...data, targetDate: data.targetDate ? new Date(data.targetDate) : undefined },
    });
  }

  updateGoal(id: string, data: Partial<{ title: string; description: string; targetDate: string; progress: number; status: string }>) {
    const d: any = { ...data };
    if (data.targetDate) d.targetDate = new Date(data.targetDate);
    return this.prisma.goal.update({ where: { id }, data: d });
  }

  deleteGoal(id: string) { return this.prisma.goal.delete({ where: { id } }); }
}
