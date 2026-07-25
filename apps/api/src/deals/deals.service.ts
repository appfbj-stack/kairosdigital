import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DealsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, leadId: string, data: any) {
    const lead = await this.prisma.lead.findFirst({ where: { id: leadId, tenantId } });
    if (!lead) throw new NotFoundException('Lead não encontrado');

    return this.prisma.deal.create({
      data: {
        tenantId,
        leadId,
        title: data.title,
        value: data.value || 0,
        stage: data.stage || 'PROSPECT',
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
        metadata: data.metadata || {},
      },
    });
  }

  async findAll(tenantId: string, filters?: { stage?: string; leadId?: string }) {
    const where: any = { tenantId };
    if (filters?.stage) where.stage = filters.stage;
    if (filters?.leadId) where.leadId = filters.leadId;

    return this.prisma.deal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        lead: { select: { id: true, name: true, phone: true, email: true } },
      },
    });
  }

  async findOne(tenantId: string, id: string) {
    const deal = await this.prisma.deal.findFirst({
      where: { id, tenantId },
      include: {
        lead: true,
        tasks: { orderBy: { dueAt: 'asc' } },
      },
    });
    if (!deal) throw new NotFoundException('Negociação não encontrada');
    return deal;
  }

  async update(tenantId: string, id: string, data: any) {
    await this.findOne(tenantId, id);
    return this.prisma.deal.update({
      where: { id },
      data: {
        title: data.title,
        value: data.value,
        stage: data.stage,
        expectedCloseDate: data.expectedCloseDate ? new Date(data.expectedCloseDate) : null,
        metadata: data.metadata,
        lostReason: data.lostReason,
        closedAt: data.stage === 'CLOSED_WON' || data.stage === 'CLOSED_LOST' ? new Date() : null,
      },
    });
  }

  async moveStage(tenantId: string, id: string, stage: string) {
    await this.findOne(tenantId, id);
    return this.prisma.deal.update({
      where: { id },
      data: {
        stage,
        closedAt: stage === 'CLOSED_WON' || stage === 'CLOSED_LOST' ? new Date() : null,
      },
    });
  }

  async delete(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.deal.delete({ where: { id } });
  }

  async getPipeline(tenantId: string) {
    const deals = await this.prisma.deal.findMany({
      where: { tenantId },
      select: { stage: true, value: true },
    });

    const stages = ['PROSPECT', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];
    return stages.map((stage) => {
      const stageDeals = deals.filter((d) => d.stage === stage);
      return {
        stage,
        count: stageDeals.length,
        totalValue: stageDeals.reduce((sum, d) => sum + Number(d.value), 0),
      };
    });
  }
}