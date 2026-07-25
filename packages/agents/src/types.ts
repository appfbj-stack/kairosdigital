import type { ChatMessage } from "@hermes/types";
import { z } from "zod";

export interface AgentContext {
  tenantId: string;
  userId: string;
  conversationId?: string;
  userMessage: string;
  history: ChatMessage[];
  metadata?: Record<string, unknown>;
}

export interface AgentTool<TArgs extends Record<string, unknown> = Record<string, unknown>> {
  name: string;
  description: string;
  schema: z.ZodSchema<TArgs>;
  execute: (args: TArgs, ctx: AgentContext) => Promise<unknown>;
}

export interface AgentResult {
  message: string;
  toolCalls?: Array<{ name: string; args: Record<string, unknown>; result?: unknown }>;
  metadata?: Record<string, unknown>;
}

export abstract class BaseAgent {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly systemPrompt: string;
  abstract readonly tools: AgentTool[];

  abstract run(ctx: AgentContext): Promise<AgentResult>;

  protected getToolByName(name: string): AgentTool | undefined {
    return this.tools.find((t) => t.name === name);
  }

  protected buildSystemMessage(extra?: string): ChatMessage {
    return {
      role: "system",
      content: extra ? `${this.systemPrompt}\n\n${extra}` : this.systemPrompt,
    };
  }
}
