import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SEED_TESTS } from './seed-tests';

@Injectable()
export class KnowledgeTestService {
  constructor(private prisma: PrismaService) {}

  async list(category?: string) {
    let where: any = { active: true };
    if (category) where.category = category;
    let tests = await this.prisma.knowledgeTest.findMany({ where });
    // Auto-seed à vide
    if (tests.length === 0) {
      await Promise.all(SEED_TESTS.map((t) => this.prisma.knowledgeTest.create({ data: t as any })));
      tests = await this.prisma.knowledgeTest.findMany({ where });
    }
    return tests;
  }

  async get(id: string) {
    const t = await this.prisma.knowledgeTest.findUnique({ where: { id } });
    if (!t) throw new NotFoundException('Test introuvable');
    // Pour le passage : on masque les correctIndex et explications
    const safe = { ...t, questions: (t.questions as any[]).map((q) => ({ question: q.question, options: q.options })) };
    return safe;
  }

  async start(testId: string, employeeId: string) {
    const test = await this.prisma.knowledgeTest.findUnique({ where: { id: testId } });
    if (!test) throw new NotFoundException('Test introuvable');
    return this.prisma.knowledgeTestAttempt.create({
      data: { testId, employeeId },
    });
  }

  async submit(attemptId: string, answers: number[]) {
    const attempt = await this.prisma.knowledgeTestAttempt.findUnique({
      where: { id: attemptId }, include: { test: true },
    });
    if (!attempt) throw new NotFoundException('Tentative introuvable');
    if (attempt.completedAt) throw new BadRequestException('Tentative déjà terminée');

    const questions = attempt.test.questions as any[];
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correctIndex) correct++; });
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= attempt.test.passingScore;
    const expiresAt = passed
      ? new Date(Date.now() + attempt.test.validityMonths * 30 * 86400000)
      : null;

    return this.prisma.knowledgeTestAttempt.update({
      where: { id: attemptId },
      data: { completedAt: new Date(), score, passed, answers: answers as any, expiresAt },
    });
  }

  async myAttempts(employeeId: string) {
    return this.prisma.knowledgeTestAttempt.findMany({
      where: { employeeId },
      orderBy: { startedAt: 'desc' },
      include: { test: { select: { id: true, title: true, category: true, passingScore: true, validityMonths: true } } },
    });
  }

  async allAttempts(tenantId?: string) {
    const where: any = {};
    if (tenantId) where.employee = { tenantId };
    return this.prisma.knowledgeTestAttempt.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      include: {
        test: { select: { id: true, title: true, category: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }
}
