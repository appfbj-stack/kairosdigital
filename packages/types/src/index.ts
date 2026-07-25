import { z } from "zod";

// ============================================
// AUTH
// ============================================
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  tenantSlug: z.string().optional(),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterTenantSchema = z.object({
  tenantName: z.string().min(2),
  tenantSlug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "slug deve ser kebab-case minúsculo"),
  ownerName: z.string().min(2),
  ownerEmail: z.string().email(),
  ownerPassword: z.string().min(8),
  planTier: z.enum(["BASIC", "PRO", "BUSINESS", "ENTERPRISE"]).default("BASIC"),
});
export type RegisterTenantInput = z.infer<typeof RegisterTenantSchema>;

export const JwtPayloadSchema = z.object({
  userId: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  role: z.enum(["SUPERADMIN", "OWNER", "ADMIN", "MEMBER", "VIEWER"]),
  email: z.string().email(),
});
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;

// ============================================
// CHAT IA
// ============================================
export const ChatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant", "tool"]),
  content: z.string(),
  name: z.string().optional(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatRequestSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1),
  model: z.string().optional(),
  agentName: z.string().optional(),
  stream: z.boolean().default(true),
  attachments: z
    .array(z.object({ url: z.string(), mimeType: z.string(), name: z.string() }))
    .optional(),
});
export type ChatRequest = z.infer<typeof ChatRequestSchema>;

// ============================================
// CONTACTS / CRM
// ============================================
export const ContactCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  tags: z.array(z.string()).optional(),
  customFields: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
  source: z.string().optional(),
  pipelineStageId: z.string().uuid().optional(),
});
export type ContactCreateInput = z.infer<typeof ContactCreateSchema>;

export const ContactUpdateSchema = ContactCreateSchema.partial();
export type ContactUpdateInput = z.infer<typeof ContactUpdateSchema>;

// ============================================
// TASKS / APPOINTMENTS
// ============================================
export const TaskCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueAt: z.coerce.date().optional(),
  assigneeId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
});
export type TaskCreateInput = z.infer<typeof TaskCreateSchema>;

export const AppointmentCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date(),
  location: z.string().optional(),
  meetingUrl: z.string().url().optional(),
  contactId: z.string().uuid().optional(),
  reminderMinutes: z.number().int().min(0).optional(),
});
export type AppointmentCreateInput = z.infer<typeof AppointmentCreateSchema>;

// ============================================
// WHATSAPP
// ============================================
export const WhatsAppCreateInstanceSchema = z.object({
  name: z.string().min(2),
  webhookUrl: z.string().url().optional(),
});
export type WhatsAppCreateInstanceInput = z.infer<typeof WhatsAppCreateInstanceSchema>;

export const WhatsAppSendMessageSchema = z.object({
  instanceId: z.string().uuid(),
  to: z.string().min(8), // phone with country code
  text: z.string().optional(),
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(["image", "audio", "video", "document"]).optional(),
});
export type WhatsAppSendMessageInput = z.infer<typeof WhatsAppSendMessageSchema>;

// ============================================
// AGENTS
// ============================================
export const AgentNameSchema = z.enum([
  "crm",
  "agenda",
  "whatsapp",
  "followup",
  "financeiro",
  "suporte",
  "devops",
  "automacao",
  "orquestrador",
]);
export type AgentName = z.infer<typeof AgentNameSchema>;

export interface AgentToolCall {
  name: string;
  args: Record<string, unknown>;
}

export interface AgentResponse {
  message: string;
  toolCalls?: AgentToolCall[];
  metadata?: Record<string, unknown>;
}

// ============================================
// API ENVELOPE
// ============================================
export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ============================================
// PAGINATION
// ============================================
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});
export type PaginationInput = z.infer<typeof PaginationSchema>;

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
