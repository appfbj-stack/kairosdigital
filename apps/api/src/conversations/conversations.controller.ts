import { Controller, Get, Post, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@ApiTags('Conversations')
@Controller('conversations')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class ConversationsController {
  constructor(private conversationsService: ConversationsService) {}

  @Post()
  @ApiOperation({ summary: 'Salvar mensagem (usado pelo bridge)' })
  async create(@Req() req: any, @Body() body: { leadId: string; channel?: string; direction: string; content: string; messageId?: string }) {
    return this.conversationsService.create(req.tenant.id, body.leadId, body);
  }

  @Get('lead/:leadId')
  @ApiOperation({ summary: 'Histórico de conversa com um lead' })
  async findByLead(@Req() req: any, @Param('leadId') leadId: string, @Query('limit') limit?: number) {
    return this.conversationsService.findByLead(req.tenant.id, leadId, limit || 50);
  }

  @Get('lead/:leadId/history')
  @ApiOperation({ summary: 'Histórico formatado para LLM' })
  async getHistory(@Req() req: any, @Param('leadId') leadId: string, @Query('limit') limit?: number) {
    return this.conversationsService.getHistory(req.tenant.id, leadId, limit || 100);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Conversas recentes (dashboard)' })
  async getRecent(@Req() req: any, @Query('limit') limit?: number) {
    return this.conversationsService.getRecentConversations(req.tenant.id, limit || 20);
  }
}