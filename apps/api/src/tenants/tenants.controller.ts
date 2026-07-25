import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';

@ApiTags('Tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo tenant (admin master)' })
  async create(@Body() dto: CreateTenantDto) {
    return this.tenantsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos tenants (admin master)' })
  async findAll() {
    return this.tenantsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar tenant por ID' })
  async findById(@Param('id') id: string) {
    return this.tenantsService.findById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Buscar tenant por slug (público para validação)' })
  async findBySlug(@Param('slug') slug: string) {
    return this.tenantsService.findBySlug(slug);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar tenant' })
  async update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.tenantsService.update(id, dto);
  }

  @Put(':id/whatsapp')
  @ApiOperation({ summary: 'Atualizar config WhatsApp do tenant' })
  async updateWhatsApp(
    @Param('id') id: string,
    @Body() data: { instance?: string; token?: string; number?: string; status?: string }
  ) {
    return this.tenantsService.updateWhatsApp(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar tenant' })
  async delete(@Param('id') id: string) {
    return this.tenantsService.delete(id);
  }
}