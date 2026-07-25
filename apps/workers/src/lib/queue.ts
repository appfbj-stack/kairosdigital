import { Queue, Worker, type Job, type Processor } from "bullmq";
import { Redis } from "ioredis";

const connection = new Redis(process.env.REDIS_URL!, { maxRetriesPerRequest: null });
const concurrency = Number(process.env.WORKERS_CONCURRENCY ?? 5);

export const queues = {
  followup: new Queue("followup", { connection }),
  whatsapp: new Queue("whatsapp", { connection }),
  usage: new Queue("usage", { connection }),
  ai: new Queue("ai", { connection }),
};

export function createWorker<T = unknown>(name: keyof typeof queues, processor: Processor<T>) {
  const worker = new Worker<T>(name, processor, { connection, concurrency });
  worker.on("completed", (job) => console.log(`[${name}] ✓ ${job.id}`));
  worker.on("failed", (job, err) => console.error(`[${name}] ✗ ${job?.id}`, err.message));
  return worker;
}

export type { Job };
