import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateLetterDto } from './dto/letter.dto';
import { LETTER_TEMPLATES } from './letter-templates';

@Injectable()
export class LetterService {
  constructor(private prisma: PrismaService) {}

  list(filters: { tenantId?: string; employeeId?: string; type?: string } = {}) {
    return this.prisma.letter.findMany({
      where: filters as any,
      orderBy: { date: 'desc' },
      include: {
        tenant: { select: { id: true, code: true, name: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async get(id: string) {
    const l = await this.prisma.letter.findUnique({ where: { id } });
    if (!l) throw new NotFoundException('Courrier introuvable');
    return l;
  }

  templates() {
    return Object.entries(LETTER_TEMPLATES).map(([key, t]) => ({ key, label: t.label }));
  }

  /**
   * Génère un courrier depuis un template.
   */
  async create(dto: CreateLetterDto, createdById: string) {
    const tpl = LETTER_TEMPLATES[dto.type];
    if (!tpl) throw new BadRequestException(`Type de courrier inconnu : ${dto.type}`);

    const [tenant, employee] = await Promise.all([
      this.prisma.tenant.findUnique({ where: { id: dto.tenantId } }),
      this.prisma.employee.findUnique({ where: { id: dto.employeeId } }),
    ]);
    if (!tenant) throw new NotFoundException('Société introuvable');
    if (!employee) throw new NotFoundException('Salarié introuvable');

    const content = dto.contentMd || tpl.build({ tenant, employee, data: dto.data });
    const subject = dto.subject || tpl.subject(employee);

    return this.prisma.letter.create({
      data: {
        tenantId: dto.tenantId,
        employeeId: dto.employeeId,
        type: dto.type,
        subject,
        contentMd: content,
        createdById,
      },
    });
  }

  async markSent(id: string, recipientEmail?: string) {
    return this.prisma.letter.update({
      where: { id },
      data: { status: 'envoye', sentAt: new Date(), recipientEmail },
    });
  }

  async delete(id: string) {
    await this.get(id);
    return this.prisma.letter.delete({ where: { id } });
  }
}
