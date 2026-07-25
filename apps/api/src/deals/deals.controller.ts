import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DealsService } from './deals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@ApiTags('Deals')
@Controller('deals')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class DealsController {
  constructor(private dealsService: DealsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar negociação' })
  async create(@Req() req: any, @Body() body: { leadId: string; title: string; value?: number; stage?: string; expectedCloseDate?: string; metadata?: any }) {
    return this.dealsService.create(req.tenant.id, body.leadId, body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar negociações' })
  async findAll(@Req() req: any, @Query('stage') stage?: string, @Query('leadId') leadId?: string) {
    return this.dealsService.findAll(req.tenant.id, { stage, leadId });
  }

  @Get('pipeline')
  @ApiOperation({ summary: 'Visão do funil (pipeline)' })
  async getPipeline(@Req() req: any) {
    return this.dealsService.getPipeline(req.tenant.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar negociação' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.dealsService.findOne(req.tenant.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar negociação' })
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.dealsService.update(req.tenant.id, id, body);
  }

  @Put(':id/stage')
  @ApiOperation({ summary: 'Mover etapa do funil' })
  async moveStage(@Req() req: any, @Param('id') id: string, @Body() body: { stage: string }) {
    return this.dealsService.moveStage(req.tenant.id, id, body.stage);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar negociação' })
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.dealsService.delete(req.tenant.id, id);
  }
}