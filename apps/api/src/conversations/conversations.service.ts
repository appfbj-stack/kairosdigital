import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, leadId: string, data: any) {
    return this.prisma.conversation.create({
      data: {
        tenantId,
        leadId,
        channel: data.channel || 'whatsapp',
        direction: data.direction || 'INBOUND',
        content: data.content,
        messageId: data.messageId,
      },
    });
  }

  async findByLead(tenantId: string, leadId: string, limit = 50) {
    return this.prisma.conversation.findMany({
      where: { tenantId, leadId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getHistory(tenantId: string, leadId: string, limit = 100) {
    const messages = await this.prisma.conversation.findMany({
      where: { tenantId, leadId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
    return messages.map(m => ({
      role: m.direction === 'INBOUND' ? 'user' : 'assistant',
      content: m.content,
      timestamp: m.createdAt,
    }));
  }

  async getRecentConversations(tenantId: string, limit = 20) {
    // Última mensagem de cada lead
    return this.prisma.$queryRaw`
      SELECT DISTINCT ON (c."leadId") c.*, l.name as "leadName", l.phone as "leadPhone"
      FROM "Conversation" c
      JOIN "Lead" l ON l.id = c."leadId"
      WHERE c."tenantId" = ${tenantId}
      ORDER BY c."leadId", c."createdAt" DESC
      LIMIT ${limit}
    `;
  }
}