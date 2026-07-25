import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class WhatsAppService {
  private client: AxiosInstance;
  private globalKey: string;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.globalKey = this.config.get('EVOLUTION_GLOBAL_KEY') || '';
    const baseURL = this.config.get('EVOLUTION_API_URL') || 'http://evogo-api:8080';
    
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.globalKey, // Global key para gerenciar instâncias
      },
      timeout: 30000,
    });
  }

  // Criar instância no Evolution GO
  async createInstance(tenantId: string, instanceName: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');

    const webhookUrl = `${this.config.get('BRIDGE_URL') || 'http://hermes-evolution-bridge:3000'}/webhook/whatsapp`;
    
    try {
      await this.client.post('/instance/create', {
        instanceName,
        webhook: webhookUrl,
        events: ['MESSAGE', 'CONNECTION', 'QRCODE'],
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
      });
    } catch (error: any) {
      if (error.response?.status !== 409) throw error; // 409 = já existe
    }

    // Atualiza tenant
    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { evolutionInstance: instanceName, whatsappStatus: 'connecting' },
    });

    return { instanceName, status: 'connecting' };
  }

  // Conectar instância (gera QR)
  async connectInstance(instanceName: string) {
    await this.client.post(`/instance/connect/${instanceName}`);
    return { status: 'connecting' };
  }

  // Obter QR Code
  async getQRCode(instanceName: string) {
    const response = await this.client.get(`/instance/qr/${instanceName}`);
    const qrCode = response.data?.qrcode || response.data?.qrCode || '';
    
    if (!qrCode) {
      throw new BadRequestException('QR Code não disponível. Chame conectar primeiro.');
    }

    // Remove prefixo data:image/png;base64, se vier
    const base64 = qrCode.replace(/^data:image\/png;base64,/, '');
    return { qrCode: base64 };
  }

  // Status da conexão
  async getConnectionState(instanceName: string) {
    const response = await this.client.get(`/instance/connectionState/${instanceName}`);
    const state = response.data?.instance?.state || 'close';
    return { state, connected: state === 'open' };
  }

  // Desconectar
  async logoutInstance(instanceName: string) {
    await this.client.delete(`/instance/logout/${instanceName}`);
    return { status: 'disconnected' };
  }

  // Listar todas instâncias (admin)
  async listInstances() {
    const response = await this.client.get('/instance/all');
    return response.data?.data || response.data || [];
  }

  // Enviar mensagem - USA TOKEN DA INSTÂNCIA
  async sendText(instanceName: string, instanceToken: string, number: string, text: string) {
    const client = axios.create({
      baseURL: this.config.get('EVOLUTION_API_URL') || 'http://evogo-api:8080',
      headers: {
        'Content-Type': 'application/json',
        'apikey': instanceToken, // TOKEN DA INSTÂNCIA!
      },
      timeout: 20000,
    });

    const response = await client.post('/send/text', { number, text });
    return response.data;
  }

  // Processar webhook do Evolution GO
  async processWebhook(payload: any) {
    const instance = payload.instance;
    const event = payload.event;
    const data = payload.data;

    if (!['MESSAGE', 'messages.upsert'].includes(event)) return { ok: true };

    // Busca tenant pela instância
    const tenant = await this.prisma.tenant.findFirst({
      where: { evolutionInstance: instance },
    });

    if (!tenant) {
      console.warn(`[Webhook] Tenant não encontrado para instância: ${instance}`);
      return { ok: true, ignored: true };
    }

    // Extrai mensagem (formato Evolution GO)
    const message = data?.message || data?.messageData?.message;
    const key = data?.key || data?.messageData?.key;
    
    if (!message || !key) return { ok: true };

    // Ignora mensagens próprias
    if (key.fromMe) return { ok: true };

    const remoteJid = key.remoteJid;
    const number = remoteJid?.split('@')[0];
    const text = this.extractText(message);

    if (!number || !text) return { ok: true };

    return {
      ok: true,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      instance,
      number,
      text,
      messageId: key.id,
      timestamp: data?.messageTimestamp || Date.now(),
    };
  }

  private extractText(message: any): string | null {
    if (message.conversation) return message.conversation;
    if (message.extendedTextMessage?.text) return message.extendedTextMessage.text;
    if (message.imageMessage?.caption) return message.imageMessage.caption;
    if (message.videoMessage?.caption) return message.videoMessage.caption;
    if (message.documentMessage?.caption) return message.documentMessage.caption;
    return null;
  }
}