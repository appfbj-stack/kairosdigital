import { prisma } from "../lib/prisma.js";
import { evolutionClient } from "../lib/evolution.js";
import { ensureWhatsAppInstanceQuota, recordMessageUsage } from "./billing.service.js";
import { env } from "../config/env.js";
import { HermesError, jidToPhone, phoneToJid, slugify } from "@hermes/utils";

export const whatsappService = {
  async createInstance(tenantId: string, name: string) {
    await ensureWhatsAppInstanceQuota(tenantId);
    const instanceName = `${slugify(name)}-${tenantId.slice(0, 8)}`;
    const webhookUrl = env.EVOLUTION_WEBHOOK_URL;

    await evolutionClient.createInstance(instanceName, webhookUrl);

    return prisma.whatsAppInstance.create({
      data: {
        tenantId,
        name,
        instanceName,
        status: "CONNECTING",
        webhookUrl,
      },
    });
  },

  async getQrCode(tenantId: string, instanceId: string) {
    const inst = await prisma.whatsAppInstance.findFirst({
      where: { id: instanceId, tenantId },
    });
    if (!inst) throw new HermesError("NOT_FOUND", "Instância não encontrada", 404);
    const qr = await evolutionClient.getQrCode(inst.instanceName);
    await prisma.whatsAppInstance.update({
      where: { id: inst.id },
      data: {
        qrCode: qr.base64 ?? qr.code ?? null,
        qrCodeExpiresAt: new Date(Date.now() + 60_000),
        status: "QR_CODE",
      },
    });
    return qr;
  },

  async list(tenantId: string) {
    return prisma.whatsAppInstance.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
  },

  async delete(tenantId: string, instanceId: string) {
    const inst = await prisma.whatsAppInstance.findFirst({
      where: { id: instanceId, tenantId },
    });
    if (!inst) throw new HermesError("NOT_FOUND", "Instância não encontrada", 404);
    try {
      await evolutionClient.deleteInstance(inst.instanceName);
    } catch (err) {
      console.warn("[whatsapp] delete falhou na Evolution, removendo localmente", err);
    }
    return prisma.whatsAppInstance.delete({ where: { id: inst.id } });
  },

  async sendText(tenantId: string, instanceId: string, to: string, text: string) {
    const inst = await prisma.whatsAppInstance.findFirst({
      where: { id: instanceId, tenantId },
    });
    if (!inst) throw new HermesError("NOT_FOUND", "Instância não encontrada", 404);
    if (inst.status !== "CONNECTED") {
      throw new HermesError("INSTANCE_DISCONNECTED", "Instância não conectada", 409);
    }
    const result = await evolutionClient.sendText(inst.instanceName, to, text);

    // Resolver/criar contato
    const phone = jidToPhone(phoneToJid(to));
    let contact = await prisma.contact.findFirst({ where: { tenantId, phone } });
    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          tenantId,
          name: phone,
          phone,
          whatsappJid: phoneToJid(to),
          source: "whatsapp-outbound",
        },
      });
    }

    // Resolver/criar conversation
    let conv = await prisma.conversation.findFirst({
      where: { tenantId, contactId: contact.id, whatsappInstanceId: inst.id },
      orderBy: { createdAt: "desc" },
    });
    if (!conv) {
      conv = await prisma.conversation.create({
        data: {
          tenantId,
          contactId: contact.id,
          whatsappInstanceId: inst.id,
          channel: "WHATSAPP",
          title: contact.name,
        },
      });
    }

    await prisma.message.create({
      data: {
        tenantId,
        conversationId: conv.id,
        externalId: result.key.id,
        direction: "OUTBOUND",
        type: "TEXT",
        content: text,
        status: "SENT",
      },
    });

    await prisma.conversation.update({
      where: { id: conv.id },
      data: { lastMessageAt: new Date() },
    });

    await recordMessageUsage({ tenantId, whatsappInstanceId: inst.id, direction: "OUTBOUND" });

    return result;
  },

  async handleEvolutionWebhook(payload: any) {
    const event = payload?.event;
    const instanceName = payload?.instance;
    if (!instanceName) return { ignored: true };

    const inst = await prisma.whatsAppInstance.findUnique({ where: { instanceName } });
    if (!inst) return { ignored: true, reason: "instance not registered" };

    switch (event) {
      case "connection.update": {
        const state = payload.data?.state;
        const map: Record<string, "CONNECTED" | "DISCONNECTED" | "CONNECTING" | "ERROR"> = {
          open: "CONNECTED",
          close: "DISCONNECTED",
          connecting: "CONNECTING",
        };
        await prisma.whatsAppInstance.update({
          where: { id: inst.id },
          data: {
            status: map[state] ?? "ERROR",
            lastConnectionAt: state === "open" ? new Date() : inst.lastConnectionAt,
            qrCode: state === "open" ? null : inst.qrCode,
          },
        });
        break;
      }
      case "qrcode.updated": {
        await prisma.whatsAppInstance.update({
          where: { id: inst.id },
          data: {
            status: "QR_CODE",
            qrCode: payload.data?.qrcode?.base64 ?? null,
            qrCodeExpiresAt: new Date(Date.now() + 60_000),
          },
        });
        break;
      }
      case "messages.upsert": {
        const msg = payload.data;
        if (!msg || msg.key?.fromMe) break;

        const remoteJid = msg.key?.remoteJid as string | undefined;
        if (!remoteJid) break;
        const phone = jidToPhone(remoteJid);
        const tenantId = inst.tenantId;

        let contact = await prisma.contact.findFirst({ where: { tenantId, phone } });
        if (!contact) {
          contact = await prisma.contact.create({
            data: {
              tenantId,
              name: msg.pushName ?? phone,
              phone,
              whatsappJid: remoteJid,
              source: "whatsapp-inbound",
            },
          });
        }

        let conv = await prisma.conversation.findFirst({
          where: { tenantId, contactId: contact.id, whatsappInstanceId: inst.id },
        });
        if (!conv) {
          conv = await prisma.conversation.create({
            data: {
              tenantId,
              contactId: contact.id,
              whatsappInstanceId: inst.id,
              channel: "WHATSAPP",
              title: contact.name,
            },
          });
        }

        const text =
          msg.message?.conversation ??
          msg.message?.extendedTextMessage?.text ??
          "[mídia]";

        await prisma.message.create({
          data: {
            tenantId,
            conversationId: conv.id,
            externalId: msg.key?.id,
            direction: "INBOUND",
            type: "TEXT",
            content: text,
            senderName: msg.pushName ?? contact.name,
            status: "DELIVERED",
          },
        });

        await prisma.conversation.update({
          where: { id: conv.id },
          data: { lastMessageAt: new Date(), unreadCount: { increment: 1 } },
        });

        await recordMessageUsage({ tenantId, whatsappInstanceId: inst.id, direction: "INBOUND" });
        break;
      }
    }
    return { ok: true };
  },
};
