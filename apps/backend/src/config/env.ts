import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  BACKEND_PORT: z.coerce.number().default(3001),
  BACKEND_HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default("7d"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  COOKIE_SECRET: z.string().min(16),
  CORS_ORIGINS: z.string().default("*"),
  BCRYPT_ROUNDS: z.coerce.number().default(12),

  OPENROUTER_API_KEY: z.string(),
  OPENROUTER_BASE_URL: z.string().url().default("https://openrouter.ai/api/v1"),
  OPENROUTER_DEFAULT_MODEL: z.string().default("deepseek/deepseek-chat-v3.1"),
  OPENROUTER_FALLBACK_MODELS: z.string().default(""),
  OPENROUTER_HTTP_REFERER: z.string().optional(),
  OPENROUTER_APP_TITLE: z.string().default("Kairos Digital"),

  EVOLUTION_API_URL: z.string().url(),
  EVOLUTION_API_KEY: z.string(),
  EVOLUTION_WEBHOOK_URL: z.string().url().optional(),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  SUPERADMIN_EMAIL: z.string().email().optional(),
  SUPERADMIN_PASSWORD: z.string().optional(),
  SUPERADMIN_NAME: z.string().optional(),

  LOG_LEVEL: z.string().default("info"),

  MERCADOLIVRE_APP_ID: z.string().optional(),
  MERCADOLIVRE_CLIENT_SECRET: z.string().optional(),
  MERCADOLIVRE_REDIRECT_URI: z.string().url().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

export const env: Env = (() => {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ ENV inválido:", parsed.error.flatten().fieldErrors);
    throw new Error("Falha ao carregar variáveis de ambiente");
  }
  return parsed.data;
})();
