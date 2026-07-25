export type AIProvider = "openrouter" | "openai" | "claude" | "gemini" | "ollama" | "hermes";

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIRequest {
  messages: AIMessage[];
  provider?: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  churchId: string;
  userId: string;
  context?: AIContext;
}

export interface AIContext {
  churchName?: string;
  userRole?: string;
  activeModule?: string;
  additionalData?: Record<string, unknown>;
}

export interface AIResponse {
  content: string;
  provider: AIProvider;
  model: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
}
