import { Controller, Get, Post, Param, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WhatsAppService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@ApiTags('WhatsApp')
@Controller('whatsapp')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class WhatsAppController {
  constructor(private whatsAppService: WhatsAppService) {}

  @Post('connect')
  @ApiOperation({ summary: 'Criar e conectar instância WhatsApp' })
  async connect(@Req() req: any) {
    const tenantId = req.tenant.id;
    const instanceName = `tenant_${tenantId.slice(0, 8)}`;
    return this.whatsAppService.createInstance(tenantId, instanceName);
  }

  @Post('qr')
  @ApiOperation({ summary: 'Gerar QR Code para conexão' })
  async getQR(@Req() req: any) {
    const instance = req.tenant.evolutionInstance;
    if (!instance) throw new Error('Instância não criada. Chame /connect primeiro.');
    return this.whatsAppService.getQRCode(instance);
  }

  @Get('status')
  @ApiOperation({ summary: 'Verificar status da conexão' })
  async getStatus(@Req() req: any) {
    const instance = req.tenant.evolutionInstance;
    if (!instance) return { connected: false, state: 'not_created' };
    return this.whatsAppService.getConnectionState(instance);
  }

  @Post('disconnect')
  @ApiOperation({ summary: 'Desconectar WhatsApp' })
  async disconnect(@Req() req: any) {
    const instance = req.tenant.evolutionInstance;
    if (!instance) return { status: 'not_connected' };
    const result = await this.whatsAppService.logoutInstance(instance);
    // Atualiza tenant
    return result;
  }

  @Post('send')
  @ApiOperation({ summary: 'Enviar mensagem de teste' })
  async sendTest(@Req() req: any, @Body() body: { number: string; text: string }) {
    const instance = req.tenant.evolutionInstance;
    const token = req.tenant.evolutionToken;
    if (!instance || !token) throw new Error('WhatsApp não conectado');
    return this.whatsAppService.sendText(instance, token, body.number, body.text);
  }
}

// Webhook público (sem auth)
@ApiTags('Webhook')
@Controller('webhook')
export class WebhookController {
  constructor(private whatsAppService: WhatsAppService) {}

  @Post('whatsapp')
  @ApiOperation({ summary: 'Webhook Evolution GO' })
  async receiveWebhook(@Req() req: any) {
    return this.whatsAppService.processWebhook(req.body);
  }
}