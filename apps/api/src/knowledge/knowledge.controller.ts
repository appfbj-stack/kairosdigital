import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { KnowledgeService } from './knowledge.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@ApiTags('Knowledge Base')
@Controller('knowledge')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class KnowledgeController {
  constructor(private knowledgeService: KnowledgeService) {}

  @Post()
  @ApiOperation({ summary: 'Criar artigo na base de conhecimento' })
  async create(@Req() req: any, @Body() body: any) {
    return this.knowledgeService.create(req.tenant.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar artigos' })
  async findAll(@Req() req: any, @Query('tags') tags?: string) {
    return this.knowledgeService.findAll(req.tenant.id, tags?.split(','));
  }

  @Get('search')
  @ApiOperation({ summary: 'Buscar na base de conhecimento' })
  async search(@Req() req: any, @Query('q') query: string, @Query('limit') limit?: number) {
    return this.knowledgeService.search(req.tenant.id, query, limit || 5);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar artigo' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.knowledgeService.findOne(req.tenant.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar artigo' })
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.knowledgeService.update(req.tenant.id, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar artigo' })
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.knowledgeService.delete(req.tenant.id, id);
  }
}