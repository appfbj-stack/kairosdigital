import { fetch } from "undici";
import { env } from "../config/env.js";

const headers = () => ({
  "Content-Type": "application/json",
  apikey: env.EVOLUTION_API_KEY,
});

async function req<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${env.EVOLUTION_API_URL}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Evolution ${res.status} ${path}: ${text}`);
  }
  return (await res.json()) as T;
}

export const evolutionClient = {
  async createInstance(instanceName: string, webhookUrl?: string) {
    return req<unknown>("POST", "/instance/create", {
      instanceName,
      qrcode: true,
      integration: "WHATSAPP-BAILEYS",
      ...(webhookUrl ? { webhook: { url: webhookUrl, events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE", "QRCODE_UPDATED"] } } : {}),
    });
  },

  async getQrCode(instanceName: string) {
    return req<{ base64?: string; code?: string }>("GET", `/instance/connect/${instanceName}`);
  },

  async getStatus(instanceName: string) {
    return req<{ instance: { state: string } }>("GET", `/instance/connectionState/${instanceName}`);
  },

  async logout(instanceName: string) {
    return req<unknown>("DELETE", `/instance/logout/${instanceName}`);
  },

  async deleteInstance(instanceName: string) {
    return req<unknown>("DELETE", `/instance/delete/${instanceName}`);
  },

  async sendText(instanceName: string, to: string, text: string) {
    return req<{ key: { id: string } }>("POST", `/message/sendText/${instanceName}`, {
      number: to,
      text,
    });
  },

  async sendMedia(
    instanceName: string,
    to: string,
    media: { mediatype: "image" | "video" | "document" | "audio"; mimetype: string; media: string; caption?: string; fileName?: string }
  ) {
    return req<unknown>("POST", `/message/sendMedia/${instanceName}`, {
      number: to,
      ...media,
    });
  },
};
