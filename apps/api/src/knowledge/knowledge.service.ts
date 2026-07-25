import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class KnowledgeService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    return this.prisma.knowledgeBase.create({
      data: {
        tenantId,
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        metadata: data.metadata || {},
      },
    });
  }

  async findAll(tenantId: string, tags?: string[]) {
    const where: any = { tenantId };
    if (tags?.length) where.tags = { hasSome: tags };
    return this.prisma.knowledgeBase.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.knowledgeBase.findFirst({ where: { id, tenantId } });
  }

  async update(tenantId: string, id: string, data: any) {
    return this.prisma.knowledgeBase.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        tags: data.tags,
        metadata: data.metadata,
      },
    });
  }

  async delete(tenantId: string, id: string) {
    return this.prisma.knowledgeBase.delete({ where: { id } });
  }

  // Busca semântica (requer pgvector + embedding externo)
  // Por enquanto busca por texto simples
  async search(tenantId: string, query: string, limit = 5) {
    const lowerQuery = query.toLowerCase();
    return this.prisma.knowledgeBase.findMany({
      where: {
        tenantId,
        OR: [
          { title: { contains: lowerQuery, mode: 'insensitive' } },
          { content: { contains: lowerQuery, mode: 'insensitive' } },
          { tags: { hasSome: lowerQuery.split(' ') } },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}