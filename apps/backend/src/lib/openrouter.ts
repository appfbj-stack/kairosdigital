import { fetch } from "undici";
import { env } from "../config/env.js";

export interface ORMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  name?: string;
  tool_call_id?: string;
  tool_calls?: Array<{ id: string; type: "function"; function: { name: string; arguments: string } }>;
}

export interface ORCompletionRequest {
  model?: string;
  messages: ORMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  tools?: Array<{ type: "function"; function: { name: string; description: string; parameters: unknown } }>;
  tool_choice?: "auto" | "none" | { type: "function"; function: { name: string } };
}

export interface ORUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ORCompletion {
  id: string;
  model: string;
  choices: Array<{
    message: { role: string; content: string | null; tool_calls?: ORMessage["tool_calls"] };
    finish_reason: string;
  }>;
  usage: ORUsage;
}

const fallbackModels = env.OPENROUTER_FALLBACK_MODELS.split(",")
  .map((m) => m.trim())
  .filter(Boolean);

function buildHeaders(): Record<string, string> {
  return {
    Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": env.OPENROUTER_HTTP_REFERER ?? "https://hermes.local",
    "X-Title": env.OPENROUTER_APP_TITLE,
  };
}

export async function chatComplete(req: ORCompletionRequest): Promise<ORCompletion> {
  const models = [req.model ?? env.OPENROUTER_DEFAULT_MODEL, ...fallbackModels];
  let lastError: unknown;
  for (const model of models) {
    try {
      const res = await fetch(`${env.OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({ ...req, model, stream: false }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenRouter ${res.status}: ${text}`);
      }
      return (await res.json()) as ORCompletion;
    } catch (err) {
      lastError = err;
      console.warn(`[openrouter] modelo ${model} falhou, tentando fallback`, err);
    }
  }
  throw lastError ?? new Error("Todos os modelos falharam");
}

/**
 * Streaming via SSE — devolve um async iterator com deltas de texto.
 */
export async function* chatStream(req: ORCompletionRequest): AsyncGenerator<
  { delta: string; usage?: ORUsage; model: string },
  void,
  void
> {
  const model = req.model ?? env.OPENROUTER_DEFAULT_MODEL;
  const res = await fetch(`${env.OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({ ...req, model, stream: true }),
  });
  if (!res.ok || !res.body) {
    const text = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${text}`);
  }

  const decoder = new TextDecoder();
  let buffer = "";
  // @ts-expect-error undici Response body é async iterable
  for await (const chunk of res.body) {
    buffer += decoder.decode(chunk as Buffer, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;
      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content ?? "";
        const usage = parsed.usage as ORUsage | undefined;
        if (delta || usage) yield { delta, usage, model };
      } catch {
        // ignore JSON parsing on partial line
      }
    }
  }
}
