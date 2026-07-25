// lib/openrouter.ts
// Todos os modelos do OpenRouter - Pagos e Gratuitos
// https://openrouter.ai/models

export interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  promptPrice: number;
  completionPrice: number;
  contextLength: number;
  category: "free" | "economy" | "standard" | "premium";
  isFree: boolean;
}

// Todos os modelos do OpenRouter
export const OPENROUTER_MODELS: OpenRouterModel[] = [
  // ========== GRATUITOS ==========
  {
    id: "meta-llama/llama-3.2-3b-instruct:free",
    name: "Llama 3.2 3B Instruct",
    description: "Modelo leve e rápido da Meta. Gratuito com rate limit.",
    promptPrice: 0,
    completionPrice: 0,
    contextLength: 131072,
    category: "free",
    isFree: true
  },
  {
    id: "meta-llama/llama-3.2-1b-instruct:free",
    name: "Llama 3.2 1B Instruct",
    description: "Modelo mais leve da Meta. Gratuito.",
    promptPrice: 0,
    completionPrice: 0,
    contextLength: 131072,
    category: "free",
    isFree: true
  },
  {
    id: "nousresearch/hermes-3-llama-3.1-405b:free",
    name: "Hermes 3 405B Instruct",
    description: "Modelo poderoso da Nous Research. Gratuito.",
    promptPrice: 0,
    completionPrice: 0,
    contextLength: 131072,
    category: "free",
    isFree: true
  },
  {
    id: "gryphe/mythomax-l2-13b:free",
    name: "MythoMax 13B",
    description: "Modelo popular para roleplay. Gratuito.",
    promptPrice: 0,
    completionPrice: 0,
    contextLength: 4096,
    category: "free",
    isFree: true
  },
  {
    id: "microsoft/phi-3-medium-128k-instruct:free",
    name: "Phi 3 Medium 128K",
    description: "Modelo da Microsoft com grande contexto. Gratuito.",
    promptPrice: 0,
    completionPrice: 0,
    contextLength: 131072,
    category: "free",
    isFree: true
  },
  {
    id: "google/gemini-1.0-pro:free",
    name: "Gemini Pro 1.0",
    description: "Modelo do Google. Gratuito com rate limit.",
    promptPrice: 0,
    completionPrice: 0,
    contextLength: 1000000,
    category: "free",
    isFree: true
  },
  {
    id: "mistralai/mistral-7b-instruct:free",
    name: "Mistral 7B Instruct",
    description: "Modelo base da Mistral. Gratuito.",
    promptPrice: 0,
    completionPrice: 0,
    contextLength: 32768,
    category: "free",
    isFree: true
  },
  {
    id: "qwen/qwen-2-7b-instruct:free",
    name: "Qwen 2 7B Instruct",
    description: "Modelo da Alibaba. Gratuito.",
    promptPrice: 0,
    completionPrice: 0,
    contextLength: 32768,
    category: "free",
    isFree: true
  },
  {
    id: "openchat/openchat-7b:free",
    name: "OpenChat 7B",
    description: "Modelo open-source otimizado para chat. Gratuito.",
    promptPrice: 0,
    completionPrice: 0,
    contextLength: 8192,
    category: "free",
    isFree: true
  },
  {
    id: "undi95/toppy-m-7b:free",
    name: "Toppy M 7B",
    description: "Modelo para tarefas gerais. Gratuito.",
    promptPrice: 0,
    completionPrice: 0,
    contextLength: 4096,
    category: "free",
    isFree: true
  },

  // ========== ECONOMY ==========
  {
    id: "qwen/qwen-2.5-7b-instruct",
    name: "Qwen 2.5 7B Instruct",
    description: "Modelo rápido e econômico da Alibaba.",
    promptPrice: 0.14,
    completionPrice: 0.28,
    contextLength: 32768,
    category: "economy",
    isFree: false
  },
  {
    id: "meta-llama/llama-3.2-3b-instruct",
    name: "Llama 3.2 3B Instruct",
    description: "Modelo leve da Meta. Rápido e barato.",
    promptPrice: 0.05,
    completionPrice: 0.08,
    contextLength: 131072,
    category: "economy",
    isFree: false
  },
  {
    id: "google/gemini-flash-1.5",
    name: "Gemini Flash 1.5",
    description: "Modelo rápido do Google. 1M tokens de contexto.",
    promptPrice: 0.08,
    completionPrice: 0.30,
    contextLength: 1000000,
    category: "economy",
    isFree: false
  },
  {
    id: "mistralai/mistral-7b-instruct",
    name: "Mistral 7B Instruct",
    description: "Modelo base da Mistral. Bom custo-benefício.",
    promptPrice: 0.06,
    completionPrice: 0.06,
    contextLength: 32768,
    category: "economy",
    isFree: false
  },
  {
    id: "meta-llama/llama-3.1-8b-instruct",
    name: "Llama 3.1 8B Instruct",
    description: "Modelo open-source da Meta. Grande contexto.",
    promptPrice: 0.06,
    completionPrice: 0.12,
    contextLength: 131072,
    category: "economy",
    isFree: false
  },
  {
    id: "nousresearch/hermes-3-llama-3.1-70b",
    name: "Hermes 3 70B Instruct",
    description: "Modelo avançado da Nous Research.",
    promptPrice: 0.30,
    completionPrice: 0.30,
    contextLength: 131072,
    category: "economy",
    isFree: false
  },
  {
    id: "sao10k/l3-euryale-70b",
    name: "Llama 3 Euryale 70B",
    description: "Modelo para criatividade e roleplay.",
    promptPrice: 0.15,
    completionPrice: 0.15,
    contextLength: 8192,
    category: "economy",
    isFree: false
  },
  {
    id: "nousresearch/hermes-2-pro-llama-3-8b",
    name: "Hermes 2 Pro 8B",
    description: "Versão melhorada do Hermes.",
    promptPrice: 0.14,
    completionPrice: 0.14,
    contextLength: 8192,
    category: "economy",
    isFree: false
  },
  {
    id: "qwen/qwen-2.5-72b-instruct",
    name: "Qwen 2.5 72B Instruct",
    description: "Modelo grande da Alibaba. Alta qualidade.",
    promptPrice: 0.36,
    completionPrice: 0.40,
    contextLength: 131072,
    category: "economy",
    isFree: false
  },
  {
    id: "deepseek/deepseek-chat",
    name: "DeepSeek V2 Chat",
    description: "Modelo chinês de alta qualidade.",
    promptPrice: 0.14,
    completionPrice: 0.28,
    contextLength: 128000,
    category: "economy",
    isFree: false
  },

  // ========== STANDARD ==========
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    description: "Versão compacta do GPT-4o. Excelente qualidade/preço.",
    promptPrice: 0.15,
    completionPrice: 0.60,
    contextLength: 128000,
    category: "standard",
    isFree: false
  },
  {
    id: "openai/gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    description: "Modelo clássico da OpenAI. Rápido e confiável.",
    promptPrice: 0.50,
    completionPrice: 1.50,
    contextLength: 16385,
    category: "standard",
    isFree: false
  },
  {
    id: "openai/gpt-3.5-turbo-16k",
    name: "GPT-3.5 Turbo 16K",
    description: "GPT-3.5 com contexto estendido.",
    promptPrice: 3.00,
    completionPrice: 4.00,
    contextLength: 16385,
    category: "standard",
    isFree: false
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    description: "Modelo rápido da Anthropic. Ótimo para chat.",
    promptPrice: 0.25,
    completionPrice: 1.25,
    contextLength: 200000,
    category: "standard",
    isFree: false
  },
  {
    id: "google/gemini-pro-1.5",
    name: "Gemini Pro 1.5",
    description: "Modelo avançado do Google. Até 2M tokens de contexto.",
    promptPrice: 1.25,
    completionPrice: 5.00,
    contextLength: 2000000,
    category: "standard",
    isFree: false
  },
  {
    id: "mistralai/mixtral-8x7b-instruct",
    name: "Mixtral 8x7B Instruct",
    description: "Modelo Mixture-of-Experts da Mistral.",
    promptPrice: 0.24,
    completionPrice: 0.24,
    contextLength: 32768,
    category: "standard",
    isFree: false
  },
  {
    id: "mistralai/mixtral-8x22b-instruct",
    name: "Mixtral 8x22B Instruct",
    description: "Versão maior do Mixtral. Mais poderoso.",
    promptPrice: 2.00,
    completionPrice: 6.00,
    contextLength: 65536,
    category: "standard",
    isFree: false
  },
  {
    id: "cohere/command-r",
    name: "Command R",
    description: "Modelo otimizado para RAG e tasks complexas.",
    promptPrice: 0.50,
    completionPrice: 1.50,
    contextLength: 128000,
    category: "standard",
    isFree: false
  },
  {
    id: "cohere/command-r-plus",
    name: "Command R+",
    description: "Versão mais poderosa do Command R.",
    promptPrice: 2.50,
    completionPrice: 10.00,
    contextLength: 128000,
    category: "standard",
    isFree: false
  },
  {
    id: "microsoft/wizardlm-2-8x22b",
    name: "WizardLM-2 8x22B",
    description: "Modelo da Microsoft. Alta performance.",
    promptPrice: 0.62,
    completionPrice: 0.62,
    contextLength: 65536,
    category: "standard",
    isFree: false
  },
  {
    id: "meta-llama/llama-3.1-70b-instruct",
    name: "Llama 3.1 70B Instruct",
    description: "Modelo grande da Meta. Alta qualidade.",
    promptPrice: 0.40,
    completionPrice: 0.40,
    contextLength: 131072,
    category: "standard",
    isFree: false
  },
  {
    id: "mistralai/mistral-large",
    name: "Mistral Large",
    description: "Flagship da Mistral. Excelente qualidade.",
    promptPrice: 2.00,
    completionPrice: 6.00,
    contextLength: 128000,
    category: "standard",
    isFree: false
  },

  // ========== PREMIUM ==========
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    description: "Modelo principal da OpenAI. Melhor qualidade geral.",
    promptPrice: 2.50,
    completionPrice: 10.00,
    contextLength: 128000,
    category: "premium",
    isFree: false
  },
  {
    id: "openai/gpt-4-turbo",
    name: "GPT-4 Turbo",
    description: "GPT-4 otimizado. Excelente para tarefas complexas.",
    promptPrice: 10.00,
    completionPrice: 30.00,
    contextLength: 128000,
    category: "premium",
    isFree: false
  },
  {
    id: "openai/gpt-4",
    name: "GPT-4",
    description: "Modelo clássico GPT-4. Alta qualidade.",
    promptPrice: 30.00,
    completionPrice: 60.00,
    contextLength: 8192,
    category: "premium",
    isFree: false
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    description: "Melhor modelo balanceado da Anthropic.",
    promptPrice: 3.00,
    completionPrice: 15.00,
    contextLength: 200000,
    category: "premium",
    isFree: false
  },
  {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    description: "Modelo mais poderoso da Anthropic. Raciocínio superior.",
    promptPrice: 15.00,
    completionPrice: 75.00,
    contextLength: 200000,
    category: "premium",
    isFree: false
  },
  {
    id: "meta-llama/llama-3.1-405b-instruct",
    name: "Llama 3.1 405B Instruct",
    description: "Flagship open-source. Rivaliza com GPT-4.",
    promptPrice: 3.50,
    completionPrice: 3.50,
    contextLength: 131072,
    category: "premium",
    isFree: false
  },
  {
    id: "google/gemini-ultra",
    name: "Gemini Ultra",
    description: "Modelo mais poderoso do Google.",
    promptPrice: 5.00,
    completionPrice: 15.00,
    contextLength: 32000,
    category: "premium",
    isFree: false
  },
  {
    id: "openrouter/auto",
    name: "Auto Router",
    description: "Seleciona automaticamente o melhor modelo para seu prompt.",
    promptPrice: -1, // Variável
    completionPrice: -1,
    contextLength: 2000000,
    category: "premium",
    isFree: false
  }
];

export const DEFAULT_MODEL = "openai/gpt-4o-mini";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

class OpenRouterService {
  private apiKey: string = "";
  private baseUrl: string = "https://openrouter.ai/api/v1";

  setApiKey(key: string) {
    this.apiKey = key.trim();
  }

  getApiKey(): string {
    return this.apiKey;
  }

  hasApiKey(): boolean {
    return this.apiKey.length > 10;
  }

  async chat(
    messages: ChatMessage[],
    model: string = DEFAULT_MODEL
  ): Promise<{ success: boolean; content?: string; error?: string }> {
    if (!this.hasApiKey()) {
      return { success: false, error: "API Key não configurada" };
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
          "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "",
          "X-Title": "Kairos Church"
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data?.error?.message || `Erro ${response.status}`
        };
      }

      return {
        success: true,
        content: data.choices?.[0]?.message?.content || ""
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || "Erro de conexão"
      };
    }
  }

  async askBibleQuestion(
    question: string,
    context: string,
    model: string = DEFAULT_MODEL
  ): Promise<{ success: boolean; content?: string; error?: string }> {
    return this.chat([
      {
        role: "system",
        content: `Você é o Kairos, um assistente bíblico cristão.
Responda sempre em português do Brasil com clareza e respeito.
Fundamente suas respostas na Palavra de Deus.

Contexto bíblico: ${context || "Nenhum contexto específico"}`
      },
      { role: "user", content: question }
    ], model);
  }

  async explainVerse(
    reference: string,
    verseText: string,
    model: string = DEFAULT_MODEL
  ): Promise<{ success: boolean; content?: string; error?: string }> {
    return this.chat([
      {
        role: "system",
        content: `Você é um teólogo especialista em Bíblia.
Explique de forma clara e prática, em português do Brasil.
Inclua: contexto histórico, significado e aplicação para hoje.`
      },
      {
        role: "user",
        content: `Explique: "${verseText}" (${reference})

Forneça:
1. Contexto histórico
2. Significado principal
3. Aplicação prática
4. Versículos relacionados`
      }
    ], model);
  }
}

export const openRouterService = new OpenRouterService();

export function saveApiKey(key: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("openrouter_api_key", key);
  }
}

export function loadApiKey(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("openrouter_api_key") || "";
  }
  return "";
}

export function saveSelectedModel(modelId: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("openrouter_model", modelId);
  }
}

export function loadSelectedModel(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("openrouter_model") || DEFAULT_MODEL;
  }
  return DEFAULT_MODEL;
}

export function formatPrice(price: number): string {
  if (price === 0) return "Grátis";
  if (price < 0) return "Variável";
  if (price < 1) {
    return `$${(price * 1000).toFixed(2)}/1K`;
  }
  return `$${price.toFixed(2)}/1M`;
}
