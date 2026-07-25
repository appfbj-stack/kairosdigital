import { Controller, Get, Post, Put, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@ApiTags('Templates')
@Controller('templates')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class TemplatesController {
  constructor(private templatesService: TemplatesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar template' })
  async create(@Req() req: any, @Body() body: any) {
    return this.templatesService.create(req.tenant.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Listar templates' })
  async findAll(@Req() req: any) {
    return this.templatesService.findAll(req.tenant.id);
  }

  @Get('render')
  @ApiOperation({ summary: 'Renderizar template com variáveis' })
  async render(@Req() req: any, @Query('name') name: string, @Query() vars: Record<string, string>) {
    return this.templatesService.render(req.tenant.id, name, vars);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar template' })
  async update(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.templatesService.update(req.tenant.id, id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar template' })
  async delete(@Req() req: any, @Param('id') id: string) {
    return this.templatesService.delete(req.tenant.id, id);
  }
}