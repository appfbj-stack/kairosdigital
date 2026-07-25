import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    // Normaliza telefone
    const phone = this.normalizePhone(data.phone);
    
    // Verifica se já existe
    const existing = await this.prisma.lead.findUnique({
      where: { tenantId_phone: { tenantId, phone } },
    });
    if (existing) throw new BadRequestException('Lead já existe para este telefone');

    return this.prisma.lead.create({
      data: {
        tenantId,
        phone,
        name: data.name,
        email: data.email,
        source: data.source || 'whatsapp',
        tags: data.tags || [],
        customData: data.customData || {},
        status: 'NEW',
      },
    });
  }

  async findAll(tenantId: string, filters?: { status?: string; search?: string; page?: number; limit?: number }) {
    const { status, search, page = 1, limit = 20 } = filters || {};
    const where: any = { tenantId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [leads, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          deals: { select: { id: true, title: true, value: true, stage: true } },
          _count: { select: { tasks: true, conversations: true } },
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return { leads, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByPhone(tenantId: string, phone: string) {
    const normalized = this.normalizePhone(phone);
    return this.prisma.lead.findUnique({
      where: { tenantId_phone: { tenantId, phone: normalized } },
      include: {
        deals: { orderBy: { createdAt: 'desc' } },
        tasks: { where: { status: 'PENDING' }, orderBy: { dueAt: 'asc' } },
        conversations: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, tenantId },
      include: {
        deals: { orderBy: { createdAt: 'desc' } },
        tasks: { orderBy: { dueAt: 'asc' } },
        conversations: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!lead) throw new NotFoundException('Lead não encontrado');
    return lead;
  }

  async update(tenantId: string, id: string, data: any) {
    await this.findOne(tenantId, id); // valida
    return this.prisma.lead.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        tags: data.tags,
        customData: data.customData,
        status: data.status,
        score: data.score,
        assignedTo: data.assignedTo,
        lastContactAt: data.lastContactAt ? new Date(data.lastContactAt) : undefined,
      },
    });
  }

  async qualify(tenantId: string, id: string, score: number, notes: string) {
    await this.findOne(tenantId, id);
    return this.prisma.lead.update({
      where: { id },
      data: {
        score: Math.max(0, Math.min(100, score)),
        status: score >= 50 ? 'QUALIFIED' : 'CONTACTED',
        customData: { ...(await this.getCustomData(tenantId, id)), qualificationNotes: notes },
      },
    });
  }

  async delete(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.lead.delete({ where: { id } });
  }

  async getStats(tenantId: string) {
    const [byStatus, total, recent] = await Promise.all([
      this.prisma.lead.groupBy({ by: ['status'], where: { tenantId }, _count: true }),
      this.prisma.lead.count({ where: { tenantId } }),
      this.prisma.lead.count({ 
        where: { tenantId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } 
      }),
    ]);
    return { byStatus, total, recent };
  }

  private normalizePhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (!cleaned.startsWith('55')) cleaned = '55' + cleaned;
    return cleaned;
  }

  private async getCustomData(tenantId: string, id: string) {
    const lead = await this.prisma.lead.findFirst({ where: { id, tenantId }, select: { customData: true } });
    return lead?.customData || {};
  }
}