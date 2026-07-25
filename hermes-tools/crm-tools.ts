// Hermes Tools para CRM Kairos Digital
// Copie este arquivo para o seu Hermes Agent ou registre as functions via API

import { z } from "zod";

// ============================================================
// TYPES
// ============================================================
interface ToolResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface LeadData {
  phone: string;
  name?: string;
  email?: string;
  source?: string;
  tags?: string[];
  customData?: Record<string, any>;
}

interface DealData {
  leadId: string;
  title: string;
  value: number;
  stage?: string;
  expectedCloseDate?: string;
  metadata?: Record<string, any>;
}

interface TaskData {
  leadId?: string;
  dealId?: string;
  title: string;
  description?: string;
  dueAt?: string;
  assignee?: string;
  type?: "FOLLOW_UP" | "CALL" | "MEETING" | "PROPOSAL" | "DOCUMENT" | "PAYMENT" | "CUSTOM";
  metadata?: Record<string, any>;
}

// ============================================================
// HTTP CLIENT (configurado pelo Hermes)
// ============================================================
const API_BASE = process.env.CRM_API_URL || "http://localhost:3001";
const TENANT_ID = process.env.CRM_TENANT_ID || ""; // Injetado pelo bridge

async function crmRequest<T>(method: string, path: string, body?: any): Promise<ToolResult<T>> {
  try {
    const response = await fetch(`${API_BASE}/api${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.CRM_API_TOKEN}`,
        "X-Tenant-ID": TENANT_ID,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json();
    if (!response.ok) return { success: false, error: data.message || "Erro na API" };
    return { success: true, data };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ============================================================
// LEADS TOOLS
// ============================================================
export const createLead = {
  name: "create_lead",
  description: "Cria novo lead no CRM",
  parameters: z.object({
    phone: z.string().describe("Telefone E.164 (ex: 5511999998888)"),
    name: z.string().optional(),
    email: z.string().email().optional(),
    source: z.string().optional().default("whatsapp"),
    tags: z.array(z.string()).optional(),
    customData: z.record(z.any()).optional(),
  }),
  execute: async (args: LeadData) => crmRequest("POST", "/leads", args),
};

export const getLead = {
  name: "get_lead",
  description: "Busca lead por ID ou telefone",
  parameters: z.object({
    id: z.string().optional(),
    phone: z.string().optional(),
  }).refine(d => d.id || d.phone, "Informe id ou phone"),
  execute: async (args: { id?: string; phone?: string }) => {
    if (args.id) return crmRequest("GET", `/leads/${args.id}`);
    return crmRequest("GET", `/leads/phone/${args.phone}`);
  },
};

export const listLeads = {
  name: "list_leads",
  description: "Lista leads com filtros",
  parameters: z.object({
    status: z.string().optional(),
    search: z.string().optional(),
    page: z.number().optional().default(1),
    limit: z.number().optional().default(20),
  }),
  execute: async (args: any) => crmRequest("GET", `/leads?${new URLSearchParams(args).toString()}`),
};

export const updateLead = {
  name: "update_lead",
  description: "Atualiza lead",
  parameters: z.object({
    id: z.string(),
    name: z.string().optional(),
    email: z.string().optional(),
    tags: z.array(z.string()).optional(),
    customData: z.record(z.any()).optional(),
    status: z.enum(["NEW", "QUALIFIED", "CONTACTED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]).optional(),
    score: z.number().min(0).max(100).optional(),
    assignedTo: z.string().optional(),
  }),
  execute: async (args: any) => {
    const { id, ...data } = args;
    return crmRequest("PUT", `/leads/${id}`, data);
  },
};

export const qualifyLead = {
  name: "qualify_lead",
  description: "Qualifica lead com score e notas",
  parameters: z.object({
    id: z.string(),
    score: z.number().min(0).max(100),
    notes: z.string(),
  }),
  execute: async (args: any) => crmRequest("PUT", `/leads/${args.id}/qualify`, { score: args.score, notes: args.notes }),
};

// ============================================================
// DEALS TOOLS
// ============================================================
export const createDeal = {
  name: "create_deal",
  description: "Cria nova negociação",
  parameters: z.object({
    leadId: z.string(),
    title: z.string(),
    value: z.number(),
    stage: z.string().optional().default("PROSPECT"),
    expectedCloseDate: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
  execute: async (args: DealData) => crmRequest("POST", "/deals", args),
};

export const getDeal = {
  name: "get_deal",
  description: "Busca negociação por ID",
  parameters: z.object({ id: z.string() }),
  execute: async (args: { id: string }) => crmRequest("GET", `/deals/${args.id}`),
};

export const listDeals = {
  name: "list_deals",
  description: "Lista negociações",
  parameters: z.object({
    stage: z.string().optional(),
    leadId: z.string().optional(),
  }),
  execute: async (args: any) => crmRequest("GET", `/deals?${new URLSearchParams(args).toString()}`),
};

export const moveDealStage = {
  name: "move_deal_stage",
  description: "Move negociação para outra etapa do funil",
  parameters: z.object({
    id: z.string(),
    stage: z.enum(["PROSPECT", "QUALIFICATION", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"]),
  }),
  execute: async (args: any) => crmRequest("PUT", `/deals/${args.id}/stage`, { stage: args.stage }),
};

export const closeDeal = {
  name: "close_deal",
  description: "Fecha negociação (ganhou/perdeu)",
  parameters: z.object({
    id: z.string(),
    won: z.boolean(),
    reason: z.string().optional(),
  }),
  execute: async (args: any) => crmRequest("PUT", `/deals/${args.id}`, { stage: args.won ? "CLOSED_WON" : "CLOSED_LOST", lostReason: args.reason }),
};

// ============================================================
// TASKS TOOLS
// ============================================================
export const createTask = {
  name: "create_task",
  description: "Cria tarefa/follow-up",
  parameters: z.object({
    leadId: z.string().optional(),
    dealId: z.string().optional(),
    title: z.string(),
    description: z.string().optional(),
    dueAt: z.string().optional(),
    assignee: z.string().optional().default("hermes"),
    type: z.enum(["FOLLOW_UP", "CALL", "MEETING", "PROPOSAL", "DOCUMENT", "PAYMENT", "CUSTOM"]).optional().default("FOLLOW_UP"),
    metadata: z.record(z.any()).optional(),
  }),
  execute: async (args: TaskData) => crmRequest("POST", "/tasks", args),
};

export const listTasks = {
  name: "list_tasks",
  description: "Lista tarefas",
  parameters: z.object({
    assignee: z.string().optional(),
    status: z.enum(["PENDING", "IN_PROGRESS", "DONE", "CANCELLED"]).optional(),
    leadId: z.string().optional(),
  }),
  execute: async (args: any) => crmRequest("GET", `/tasks?${new URLSearchParams(args).toString()}`),
};

export const completeTask = {
  name: "complete_task",
  description: "Marca tarefa como concluída",
  parameters: z.object({ id: z.string() }),
  execute: async (args: { id: string }) => crmRequest("PUT", `/tasks/${args.id}/complete`, {}),
};

// ============================================================
// CONVERSATIONS
// ============================================================
export const getConversationHistory = {
  name: "get_conversation_history",
  description: "Histórico de conversas do lead",
  parameters: z.object({
    leadId: z.string(),
    limit: z.number().optional().default(50),
  }),
  execute: async (args: any) => crmRequest("GET", `/conversations/lead/${args.leadId}?limit=${args.limit}`),
};

// ============================================================
// KNOWLEDGE BASE
// ============================================================
export const searchKB = {
  name: "search_kb",
  description: "Busca na base de conhecimento (RAG)",
  parameters: z.object({
    query: z.string(),
    tags: z.array(z.string()).optional(),
    limit: z.number().optional().default(5),
  }),
  execute: async (args: any) => crmRequest("POST", "/knowledge/search", args),
};

export const addKB = {
  name: "add_kb",
  description: "Adiciona documento na base de conhecimento",
  parameters: z.object({
    title: z.string(),
    content: z.string(),
    tags: z.array(z.string()).optional(),
  }),
  execute: async (args: any) => crmRequest("POST", "/knowledge", args),
};

// ============================================================
// WHATSAPP
// ============================================================
export const sendWhatsAppText = {
  name: "send_whatsapp_text",
  description: "Envia mensagem WhatsApp via Evolution GO",
  parameters: z.object({
    number: z.string().describe("Telefone E.164 do destinatário"),
    text: z.string(),
  }),
  execute: async (args: { number: string; text: string }) => crmRequest("POST", "/whatsapp/send", args),
};

export const sendWhatsAppTemplate = {
  name: "send_whatsapp_template",
  description: "Envia template WhatsApp aprovado",
  parameters: z.object({
    number: z.string(),
    templateName: z.string(),
    variables: z.record(z.string()).optional(),
  }),
  execute: async (args: any) => crmRequest("POST", "/whatsapp/send-template", args),
};

// ============================================================
// REGISTRY (para Hermes carregar todas)
// ============================================================
export const crmTools = [
  createLead, getLead, listLeads, updateLead, qualifyLead,
  createDeal, getDeal, listDeals, moveDealStage, closeDeal,
  createTask, listTasks, completeTask,
  getConversationHistory,
  searchKB, addKB,
  sendWhatsAppText, sendWhatsAppTemplate,
];

// Export para uso direto
export default crmTools;