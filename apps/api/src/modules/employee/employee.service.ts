import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  list(filters: { tenantId?: string; status?: string; departmentId?: string } = {}) {
    return this.prisma.employee.findMany({
      where: filters as any,
      include: { department: true, manager: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  async get(id: string) {
    const e = await this.prisma.employee.findUnique({
      where: { id },
      include: { department: true, manager: true, tenant: true, subordinates: true },
    });
    if (!e) throw new NotFoundException('Collaborateur introuvable');
    return e;
  }

  create(data: any) {
    return this.prisma.employee.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.employee.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.employee.delete({ where: { id } });
  }
}
