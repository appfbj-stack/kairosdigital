import { buildServer } from "./server.js";
import { env } from "./config/env.js";

const start = async () => {
  const app = await buildServer();
  try {
    await app.listen({ port: env.BACKEND_PORT, host: env.BACKEND_HOST });
    app.log.info(`🚀 Kairos API running on http://${env.BACKEND_HOST}:${env.BACKEND_PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
