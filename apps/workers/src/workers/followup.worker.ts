import { PrismaClient } from "@prisma/client";
import { createWorker } from "../lib/queue.js";

const prisma = new PrismaClient();

interface FollowupJob {
  tenantId: string;
  contactId: string;
  step: number; // 1=D+1, 2=D+3, 3=D+7
}

export const followupWorker = createWorker<FollowupJob>("followup", async (job) => {
  const { tenantId, contactId, step } = job.data;
  const contact = await prisma.contact.findFirst({ where: { id: contactId, tenantId } });
  if (!contact) return { skipped: true };

  // Cria uma tarefa de follow-up automaticamente
  await prisma.task.create({
    data: {
      tenantId,
      title: `Follow-up D+${step === 1 ? 1 : step === 2 ? 3 : 7} — ${contact.name}`,
      priority: step >= 3 ? "HIGH" : "MEDIUM",
      contactId: contact.id,
      tags: ["followup", `step-${step}`],
      dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  return { ok: true };
});
