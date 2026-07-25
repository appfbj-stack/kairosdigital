import { PrismaClient } from "@prisma/client";
import { createWorker } from "../lib/queue.js";

const prisma = new PrismaClient();

interface UsageJob {
  tenantId: string;
  type: "ai" | "whatsapp";
  amount: number;
  meta?: Record<string, unknown>;
}

/**
 * Worker que agrega métricas de uso em background, evitando lock de chat.
 */
export const usageWorker = createWorker<UsageJob>("usage", async (job) => {
  const { tenantId, type, amount, meta } = job.data;
  await prisma.auditLog.create({
    data: {
      tenantId,
      action: `usage.${type}`,
      level: "INFO",
      message: `+${amount}`,
      metadata: meta as any,
    },
  });
});
