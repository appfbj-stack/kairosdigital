import bcrypt from "bcryptjs";
import { nanoid, customAlphabet } from "nanoid";

// ============================================
// PASSWORDS
// ============================================
export async function hashPassword(plain: string, rounds = 12): Promise<string> {
  return bcrypt.hash(plain, rounds);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ============================================
// TOKENS / IDS
// ============================================
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sem 0/O/1/I
export const shortId = customAlphabet(alphabet, 10);
export const refreshToken = () => nanoid(64);
export const apiKey = () => `hk_${nanoid(40)}`;

// ============================================
// SLUG
// ============================================
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 50);
}

// ============================================
// PHONE
// ============================================
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function phoneToJid(phone: string): string {
  const digits = normalizePhone(phone);
  return `${digits}@s.whatsapp.net`;
}

export function jidToPhone(jid: string): string {
  return jid.split("@")[0] || "";
}

// ============================================
// SLEEP / RETRY
// ============================================
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function retry<T>(
  fn: () => Promise<T>,
  opts: { attempts?: number; delayMs?: number; backoff?: number } = {}
): Promise<T> {
  const { attempts = 3, delayMs = 500, backoff = 2 } = opts;
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await sleep(delayMs * Math.pow(backoff, i));
    }
  }
  throw lastErr;
}

// ============================================
// ERRORS
// ============================================
export class HermesError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: unknown
  ) {
    super(message);
    this.name = "HermesError";
  }
}

export class UnauthorizedError extends HermesError {
  constructor(message = "Não autorizado") {
    super("UNAUTHORIZED", message, 401);
  }
}

export class ForbiddenError extends HermesError {
  constructor(message = "Acesso negado") {
    super("FORBIDDEN", message, 403);
  }
}

export class NotFoundError extends HermesError {
  constructor(resource = "Recurso") {
    super("NOT_FOUND", `${resource} não encontrado`, 404);
  }
}

export class ValidationError extends HermesError {
  constructor(message = "Dados inválidos", details?: unknown) {
    super("VALIDATION_ERROR", message, 422, details);
  }
}

export class QuotaExceededError extends HermesError {
  constructor(resource: string, limit: number) {
    super("QUOTA_EXCEEDED", `Limite excedido: ${resource} (max ${limit})`, 402, { resource, limit });
  }
}

// ============================================
// LOGGER (estruturado)
// ============================================
export function createLogger(scope: string) {
  const fmt = (level: string, msg: string, meta?: Record<string, unknown>) => {
    const entry = {
      ts: new Date().toISOString(),
      level,
      scope,
      msg,
      ...meta,
    };
    return JSON.stringify(entry);
  };
  return {
    debug: (msg: string, meta?: Record<string, unknown>) =>
      process.env.LOG_LEVEL === "debug" && console.log(fmt("debug", msg, meta)),
    info: (msg: string, meta?: Record<string, unknown>) => console.log(fmt("info", msg, meta)),
    warn: (msg: string, meta?: Record<string, unknown>) => console.warn(fmt("warn", msg, meta)),
    error: (msg: string, meta?: Record<string, unknown>) => console.error(fmt("error", msg, meta)),
  };
}
