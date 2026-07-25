import { followupWorker } from "./workers/followup.worker.js";
import { whatsappWorker } from "./workers/whatsapp.worker.js";
import { usageWorker } from "./workers/usage.worker.js";

console.log("⚙️  Hermes Workers iniciando…");

const workers = [followupWorker, whatsappWorker, usageWorker];

console.log(`✅ ${workers.length} workers ativos: followup, whatsapp, usage`);

const shutdown = async () => {
  console.log("🛑 Encerrando workers…");
  await Promise.all(workers.map((w) => w.close()));
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
