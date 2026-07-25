import { z } from "zod";
import type { AgentTool } from "./types";

// Tool stubs — implementação real conecta com services do backend via deps injetadas.
// Em runtime, o backend "monta" cada tool ligando ao Prisma + serviços via factory.
// Aqui declaramos os SCHEMAS e CONTRATOS.

export const createContactTool: AgentTool<{
  name: string;
  email?: string;
  phone?: string;
  tags?: string[];
}> = {
  name: "create_contact",
  description: "Cria um novo contato/lead no CRM",
  schema: z.object({
    name: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
  execute: async () => {
    throw new Error("create_contact: handler precisa ser registrado pelo backend");
  },
};

export const searchContactsTool: AgentTool<{ query: string }> = {
  name: "search_contacts",
  description: "Busca contatos por nome, email ou telefone",
  schema: z.object({ query: z.string().min(1) }),
  execute: async () => {
    throw new Error("search_contacts: handler precisa ser registrado pelo backend");
  },
};

export const moveContactStageTool: AgentTool<{ contactId: string; stageId: string }> = {
  name: "move_contact_stage",
  description: "Move um contato para outro estágio do pipeline",
  schema: z.object({ contactId: z.string().uuid(), stageId: z.string().uuid() }),
  execute: async () => {
    throw new Error("move_contact_stage: handler precisa ser registrado pelo backend");
  },
};

export const createTaskTool: AgentTool<{
  title: string;
  dueAt?: string;
  contactId?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
}> = {
  name: "create_task",
  description: "Cria uma tarefa",
  schema: z.object({
    title: z.string().min(1),
    dueAt: z.string().optional(),
    contactId: z.string().uuid().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  }),
  execute: async () => {
    throw new Error("create_task: handler precisa ser registrado pelo backend");
  },
};

export const createAppointmentTool: AgentTool<{
  title: string;
  startAt: string;
  endAt: string;
  contactId?: string;
}> = {
  name: "create_appointment",
  description: "Agenda um compromisso/reunião",
  schema: z.object({
    title: z.string().min(1),
    startAt: z.string(),
    endAt: z.string(),
    contactId: z.string().uuid().optional(),
  }),
  execute: async () => {
    throw new Error("create_appointment: handler precisa ser registrado pelo backend");
  },
};

export const sendWhatsAppTool: AgentTool<{
  instanceId: string;
  to: string;
  text: string;
}> = {
  name: "send_whatsapp",
  description: "Envia mensagem de texto via WhatsApp",
  schema: z.object({
    instanceId: z.string().uuid(),
    to: z.string().min(8),
    text: z.string().min(1),
  }),
  execute: async () => {
    throw new Error("send_whatsapp: handler precisa ser registrado pelo backend");
  },
};

export const listOverdueContactsTool: AgentTool<{ days?: number }> = {
  name: "list_overdue_contacts",
  description: "Lista contatos sem interação há N dias (default 7)",
  schema: z.object({ days: z.number().int().min(1).optional() }),
  execute: async () => {
    throw new Error("list_overdue_contacts: handler precisa ser registrado pelo backend");
  },
};

export const getUsageTool: AgentTool<{ period?: "today" | "month" | "all" }> = {
  name: "get_usage",
  description: "Retorna consumo atual do tenant (IA + WhatsApp)",
  schema: z.object({ period: z.enum(["today", "month", "all"]).optional() }),
  execute: async () => {
    throw new Error("get_usage: handler precisa ser registrado pelo backend");
  },
};

export const meliGetAuthUrlTool: AgentTool = {
  name: "meli_get_auth_url",
  description: "Gera o link de autorizacao para o cliente conectar a conta do Mercado Livre ao Hermes",
  schema: z.object({}),
  execute: async () => {
    throw new Error("meli_get_auth_url: handler precisa ser registrado pelo backend");
  },
};

export const meliCreateProductTool: AgentTool<{
  title: string;
  category_id: string;
  price: number;
  available_quantity: number;
  description?: string;
}> = {
  name: "meli_create_product",
  description: "Cadastra um novo produto no Mercado Livre do cliente vinculado",
  schema: z.object({
    title: z.string().min(1),
    category_id: z.string().min(3),
    price: z.number().positive(),
    available_quantity: z.number().int().min(1),
    description: z.string().optional(),
  }),
  execute: async () => {
    throw new Error("meli_create_product: handler precisa ser registrado pelo backend");
  },
};

export const meliUpdateProductTool: AgentTool<{
  item_id: string;
  price?: number;
  available_quantity?: number;
  description?: string;
}> = {
  name: "meli_update_product",
  description: "Edita preco, estoque ou descricao de um produto existente no Mercado Livre",
  schema: z.object({
    item_id: z.string().min(3),
    price: z.number().positive().optional(),
    available_quantity: z.number().int().min(0).optional(),
    description: z.string().optional(),
  }),
  execute: async () => {
    throw new Error("meli_update_product: handler precisa ser registrado pelo backend");
  },
};

export const meliGetMetricsTool: AgentTool<{
  item_id: string;
}> = {
  name: "meli_get_metrics",
  description: "Consulta metricas de desempenho e visitas de um anuncio no Mercado Livre",
  schema: z.object({
    item_id: z.string().min(3),
  }),
  execute: async () => {
    throw new Error("meli_get_metrics: handler precisa ser registrado pelo backend");
  },
};

export const meliListOrdersTool: AgentTool<{
  days?: number;
}> = {
  name: "meli_list_orders",
  description: "Lista pedidos recentes do Mercado Livre com status, valor e comprador",
  schema: z.object({
    days: z.number().int().min(1).max(90).optional(),
  }),
  execute: async () => {
    throw new Error("meli_list_orders: handler precisa ser registrado pelo backend");
  },
};

export const meliSearchProductsTool: AgentTool<{
  query: string;
  limit?: number;
  category?: string;
}> = {
  name: "meli_search_products",
  description: "Busca produtos no Mercado Livre por termo, categoria e limite. Retorna titulo, preco, quantidade vendida, vendedor. Use para pesquisar concorrentes e precos de mercado.",
  schema: z.object({
    query: z.string().min(1),
    limit: z.number().int().min(1).max(50).optional(),
    category: z.string().optional(),
  }),
  execute: async () => {
    throw new Error("meli_search_products: handler precisa ser registrado pelo backend");
  },
};

export const meliAnalyzeCompetitorTool: AgentTool<{
  seller_id: number;
}> = {
  name: "meli_analyze_competitor",
  description: "Analisa um vendedor concorrente: total de produtos, total de vendas estimadas, preco medio, reputacao, top 10 produtos mais vendidos",
  schema: z.object({
    seller_id: z.number().int().positive(),
  }),
  execute: async () => {
    throw new Error("meli_analyze_competitor: handler precisa ser registrado pelo backend");
  },
};

export const meliItemDetailTool: AgentTool<{
  item_id: string;
}> = {
  name: "meli_item_detail",
  description: "Consulta detalhes de um item no Mercado Livre: preco, quantidade vendida, taxa de conversao (sell-through), estoque inicial vs atual",
  schema: z.object({
    item_id: z.string().min(3),
  }),
  execute: async () => {
    throw new Error("meli_item_detail: handler precisa ser registrado pelo backend");
  },
};

export const meliTrendingTool: AgentTool<{
  category_id: string;
}> = {
  name: "meli_trending",
  description: "Retorna produtos e termos em alta (trending) em uma categoria do Mercado Livre",
  schema: z.object({
    category_id: z.string().min(3),
  }),
  execute: async () => {
    throw new Error("meli_trending: handler precisa ser registrado pelo backend");
  },
};

export const ALL_TOOLS = [
  createContactTool,
  searchContactsTool,
  moveContactStageTool,
  createTaskTool,
  createAppointmentTool,
  sendWhatsAppTool,
  listOverdueContactsTool,
  getUsageTool,
  meliGetAuthUrlTool,
  meliCreateProductTool,
  meliUpdateProductTool,
  meliGetMetricsTool,
  meliListOrdersTool,
  meliSearchProductsTool,
  meliAnalyzeCompetitorTool,
  meliItemDetailTool,
  meliTrendingTool,
];

/**
 * Converte uma tool Hermes para o formato function-calling do OpenRouter/OpenAI.
 */
export function toOpenRouterTool(tool: AgentTool) {
  // Zod -> JSON schema simplificado (production: usar zod-to-json-schema)
  return {
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: zodToJsonSchemaShallow(tool.schema as z.ZodObject<z.ZodRawShape>),
    },
  };
}

function zodToJsonSchemaShallow(schema: z.ZodObject<z.ZodRawShape>) {
  const shape = schema.shape;
  const properties: Record<string, unknown> = {};
  const required: string[] = [];
  for (const [key, val] of Object.entries(shape)) {
    const def = (val as z.ZodTypeAny)._def;
    let type = "string";
    if (def.typeName === "ZodNumber") type = "number";
    else if (def.typeName === "ZodBoolean") type = "boolean";
    else if (def.typeName === "ZodArray") type = "array";
    properties[key] = { type, description: def.description ?? "" };
    if (!(val as z.ZodTypeAny).isOptional()) required.push(key);
  }
  return { type: "object", properties, required };
}
