import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    return this.prisma.task.create({
      data: {
        tenantId,
        leadId: data.leadId,
        dealId: data.dealId,
        title: data.title,
        description: data.description,
        dueAt: data.dueAt ? new Date(data.dueAt) : null,
        assignee: data.assignee || 'hermes',
        type: data.type || 'FOLLOW_UP',
        metadata: data.metadata || {},
      },
    });
  }

  async findAll(tenantId: string, filters?: { assignee?: string; status?: string; leadId?: string }) {
    const where: any = { tenantId };
    if (filters?.assignee) where.assignee = filters.assignee;
    if (filters?.status) where.status = filters.status;
    if (filters?.leadId) where.leadId = filters.leadId;

    return this.prisma.task.findMany({
      where,
      orderBy: [{ status: 'asc' }, { dueAt: 'asc' }],
      include: {
        lead: { select: { id: true, name: true, phone: true } },
        deal: { select: { id: true, title: true } },
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, tenantId },
      include: { lead: true, deal: true },
    });
    if (!task) throw new NotFoundException('Tarefa não encontrada');
    return task;
  }

  async update(tenantId: string, id: string, data: any) {
    await this.findOne(tenantId, id);
    return this.prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        dueAt: data.dueAt ? new Date(data.dueAt) : null,
        assignee: data.assignee,
        status: data.status,
        type: data.type,
        metadata: data.metadata,
        doneAt: data.status === 'DONE' ? new Date() : null,
      },
    });
  }

  async complete(tenantId: string, id: string) {
    return this.update(tenantId, id, { status: 'DONE' });
  }

  async delete(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.task.delete({ where: { id } });
  }

  async getUpcoming(tenantId: string, days = 7) {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return this.prisma.task.findMany({
      where: {
        tenantId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        dueAt: { gte: now, lte: future },
      },
      orderBy: { dueAt: 'asc' },
      include: { lead: { select: { name: true, phone: true } } },
    });
  }
}