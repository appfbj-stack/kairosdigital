import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@ApiTags('Leads')
@Controller('leads')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar lead' })
  async create(@Req() req: any, @Body() body: any) {
    return this.leadsService.create(req.tenant.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar leads com filtros' })
  async findAll(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.leadsService.findAll(req.tenant.id, { status, search, page, limit });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estatísticas dos leads' })
  async getStats(@Req() req: any) {
    return this.leadsService.getStats(req.tenant.id);
  }

  @Get('phone/:phone')
  @ApiOperation({ summary: 'Buscar lead por telefone' })
  async findByPhone(@Req() req: any, @Param('phone') phone: string) {
    return this.leadsService.findByPhone(req.tenant.id, phone);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar lead por ID' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.leadsService.findOne(req.tenant.id, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar lead' })
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.leadsService.update(req.tenant.id, id, body);
  }

  @Put(':id/qualify')
  @ApiOperation({ summary: 'Qualificar lead (score + notas)' })
  async qualify(@Req() req: any, @Param('id') id: string, @Body() body: { score: number; notes: string }) {
    return this.leadsService.qualify(req.tenant.id, id, body.score, body.notes);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar lead' })
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.leadsService.delete(req.tenant.id, id);
  }
}