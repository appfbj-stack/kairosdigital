import { z } from "zod";

export const createRoomSchema = z.object({
  name: z.string().min(2, "Nome obrigatório").max(50),
  type: z.enum(["general", "ministry", "cell", "direct"]).default("general"),
  description: z.string().max(200).optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(4000),
  type: z.enum(["text", "image", "audio", "file"]).default("text"),
  mediaUrl: z.string().url().optional(),
});

export type CreateRoomSchema = z.infer<typeof createRoomSchema>;
export type SendMessageSchema = z.infer<typeof sendMessageSchema>;
