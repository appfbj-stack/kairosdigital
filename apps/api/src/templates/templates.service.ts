import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TemplatesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: any) {
    return this.prisma.messageTemplate.create({
      data: {
        tenantId,
        name: data.name,
        channel: data.channel || 'whatsapp',
        content: data.content,
        variables: data.variables || [],
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.messageTemplate.findMany({
      where: { tenantId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    return this.prisma.messageTemplate.findFirst({ where: { id, tenantId } });
  }

  async render(tenantId: string, name: string, variables: Record<string, string>) {
    const template = await this.prisma.messageTemplate.findFirst({
      where: { tenantId, name, isActive: true },
    });
    if (!template) return null;

    let content = template.content;
    for (const [key, value] of Object.entries(variables)) {
      content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return { content, variables: template.variables };
  }
}