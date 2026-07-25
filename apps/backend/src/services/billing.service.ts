import { prisma } from "../lib/prisma.js";
import { QuotaExceededError } from "@hermes/utils";

/**
 * Garante que o tenant ainda pode consumir mais 1 mensagem IA dentro do mês.
 * Lança QuotaExceededError se o limite foi atingido.
 */
export async function ensureAiQuota(tenantId: string): Promise<void> {
  const sub = await prisma.subscription.findUnique({
    where: { tenantId },
    include: { plan: true },
  });
  if (!sub) throw new QuotaExceededError("Sem assinatura", 0);

  const periodStart = sub.currentPeriodStart;
  const consumed = await prisma.aiUsage.count({
    where: { tenantId, createdAt: { gte: periodStart } },
  });

  if (consumed >= sub.plan.maxAiMessages) {
    throw new QuotaExceededError("mensagens-ia", sub.plan.maxAiMessages);
  }
}

export async function ensureWhatsAppInstanceQuota(tenantId: string): Promise<void> {
  const sub = await prisma.subscription.findUnique({
    where: { tenantId },
    include: { plan: true },
  });
  if (!sub) throw new QuotaExceededError("Sem assinatura", 0);
  const count = await prisma.whatsAppInstance.count({ where: { tenantId } });
  if (count >= sub.plan.maxWhatsApps) {
    throw new QuotaExceededError("whatsapp-instancias", sub.plan.maxWhatsApps);
  }
}

export async function recordAiUsage(args: {
  tenantId: string;
  userId?: string | null;
  model: string;
  promptTokens: number;
  completionTokens: number;
  agentName?: string;
  conversationId?: string;
}) {
  return prisma.aiUsage.create({
    data: {
      tenantId: args.tenantId,
      userId: args.userId ?? null,
      model: args.model,
      promptTokens: args.promptTokens,
      completionTokens: args.completionTokens,
      totalTokens: args.promptTokens + args.completionTokens,
      agentName: args.agentName,
      conversationId: args.conversationId,
    },
  });
}

export async function recordMessageUsage(args: {
  tenantId: string;
  whatsappInstanceId?: string;
  direction: "INBOUND" | "OUTBOUND";
}) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return prisma.messageUsage.upsert({
    where: {
      tenantId_whatsappInstanceId_direction_date: {
        tenantId: args.tenantId,
        whatsappInstanceId: args.whatsappInstanceId ?? null as any,
        direction: args.direction,
        date,
      },
    },
    update: { count: { increment: 1 } },
    create: {
      tenantId: args.tenantId,
      whatsappInstanceId: args.whatsappInstanceId,
      direction: args.direction,
      date,
      count: 1,
    },
  });
}

export async function getUsageSummary(tenantId: string) {
  const sub = await prisma.subscription.findUnique({
    where: { tenantId },
    include: { plan: true },
  });
  if (!sub) return null;

  const [aiCount, waCount, instances] = await Promise.all([
    prisma.aiUsage.aggregate({
      where: { tenantId, createdAt: { gte: sub.currentPeriodStart } },
      _count: true,
      _sum: { totalTokens: true },
    }),
    prisma.messageUsage.aggregate({
      where: { tenantId, date: { gte: sub.currentPeriodStart } },
      _sum: { count: true },
    }),
    prisma.whatsAppInstance.count({ where: { tenantId } }),
  ]);

  return {
    plan: sub.plan,
    period: { start: sub.currentPeriodStart, end: sub.currentPeriodEnd },
    ai: {
      used: aiCount._count,
      limit: sub.plan.maxAiMessages,
      tokens: aiCount._sum.totalTokens ?? 0,
    },
    whatsapp: {
      messages: waCount._sum.count ?? 0,
      instances,
      instancesLimit: sub.plan.maxWhatsApps,
    },
  };
}
