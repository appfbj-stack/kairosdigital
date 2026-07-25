import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTenantDto) {
    const existing = await this.prisma.tenant.findUnique({ where: { slug: dto.slug } });
    if (existing) throw new BadRequestException('Slug já em uso');

    return this.prisma.tenant.create({
      data: {
        slug: dto.slug,
        name: dto.name,
        tradeName: dto.tradeName,
        vertical: dto.vertical || 'CUSTOM',
        primaryColor: dto.primaryColor || '#2563eb',
        secondaryColor: dto.secondaryColor || '#1e40af',
        welcomeMsg: dto.welcomeMsg,
        verticalConfig: dto.verticalConfig || this.getDefaultVerticalConfig(dto.vertical),
        customPrompt: dto.customPrompt,
      },
    });
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        name: true,
        tradeName: true,
        vertical: true,
        whatsappNumber: true,
        whatsappStatus: true,
        planPlan: true,
        createdAt: true,
      },
    });
  }

  async findBySlug(slug: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { slug } });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');
    return tenant;
  }

  async findById(id: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Tenant não encontrado');
    return tenant;
  }

  async update(id: string, dto: UpdateTenantDto) {
    await this.findById(id);
    return this.prisma.tenant.update({
      where: { id },
      data: {
        name: dto.name,
        tradeName: dto.tradeName,
        vertical: dto.vertical,
        primaryColor: dto.primaryColor,
        secondaryColor: dto.secondaryColor,
        logoUrl: dto.logoUrl,
        welcomeMsg: dto.welcomeMsg,
        verticalConfig: dto.verticalConfig,
        customPrompt: dto.customPrompt,
        planPlan: dto.planPlan,
        maxLeads: dto.maxLeads,
        maxMessagesMonth: dto.maxMessagesMonth,
      },
    });
  }

  async updateWhatsApp(id: string, data: { instance?: string; token?: string; number?: string; status?: string }) {
    await this.findById(id);
    return this.prisma.tenant.update({
      where: { id },
      data: {
        evolutionInstance: data.instance,
        evolutionToken: data.token,
        whatsappNumber: data.number,
        whatsappStatus: data.status,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    return this.prisma.tenant.delete({ where: { id } });
  }

  // Configurações padrão por vertical
  private getDefaultVerticalConfig(vertical?: string) {
    const configs: Record<string, any> = {
      REAL_ESTATE: {
        leadFields: ["budget", "property_type", "bedrooms", "location", "financing", "urgency"],
        dealFields: ["property_id", "commission_percent", "financing_approved", "visit_scheduled"],
        pipelineStages: [
          { name: "Novo Lead", order: 1, color: "#3b82f6" },
          { name: "Qualificação", order: 2, color: "#8b5cf6" },
          { name: "Agendou Visita", order: 3, color: "#f59e0b" },
          { name: "Fez Proposta", order: 4, color: "#06b6d4" },
          { name: "Negociação", order: 5, color: "#f97316" },
          { name: "Fechado ✓", order: 6, color: "#22c55e", isWon: true },
          { name: "Perdido", order: 7, color: "#ef4444", isLost: true },
        ],
        templates: {
          boas_vindas: "Oi {{lead.name}}! 👋 Sou o assistente da {{tenant.name}}. Vi que você busca {{lead.verticalData.property_type}} na região de {{lead.verticalData.location}}. Qual seu orçamento aproximado?",
          agendamento_visita: "Perfeito! Temos {{lead.verticalData.property_type}} lindos no seu perfil. Que dia/hora prefere visitar? 🗓️",
          proposta: "Olá {{lead.name}}, sua proposta para o imóvel {{deal.verticalData.property_id}} de R$ {{deal.value}} foi enviada. Aguardamos retorno! 📝",
        },
        kbCategories: ["imoveis", "financiamento", "documentacao", "bairros", "condominios"],
        qualificationQuestions: [
          "Qual seu orçamento máximo?",
          "Tipo de imóvel (casa, apto, terreno, comercial)?",
          "Quantos quartos precisa?",
          "Região/bairro de preferência?",
          "Vai financiar? Já tem pré-aprovado?",
          "Quando pretende se mudar?",
        ],
      },
      AUTOMOTIVE: {
        leadFields: ["vehicle_brand", "vehicle_model", "vehicle_year", "vehicle_plate", "service_type", "mileage"],
        dealFields: ["service_items", "parts_needed", "estimated_hours", "warranty"],
        pipelineStages: [
          { name: "Novo Contato", order: 1, color: "#3b82f6" },
          { name: "Diagnóstico", order: 2, color: "#8b5cf6" },
          { name: "Orçamento Enviado", order: 3, color: "#f59e0b" },
          { name: "Aprovado", order: 4, color: "#06b6d4" },
          { name: "Em Execução", order: 5, color: "#f97316" },
          { name: "Pronto ✓", order: 6, color: "#22c55e", isWon: true },
          { name: "Não Aprovado", order: 7, color: "#ef4444", isLost: true },
        ],
        templates: {
          boas_vindas: "Oi {{lead.name}}! 🔧 Sou da {{tenant.name}}. Vi que seu {{lead.verticalData.vehicle_brand}} {{lead.verticalData.vehicle_model}} ({{lead.verticalData.vehicle_year}}) precisa de {{lead.verticalData.service_type}}. Qual a quilometragem atual?",
          orcamento: "Orçamento pronto para {{lead.verticalData.vehicle_brand}} {{lead.verticalData.vehicle_model}}:
{{deal.verticalData.service_items}}
Total: R$ {{deal.value}}
Aprovamos? ✅",
          pronto: "Seu carro está pronto! 🚗✨ Total: R$ {{deal.value}}. Pode buscar quando quiser. Garantia de 90 dias nas peças.",
        },
        kbCategories: ["servicos", "pecas", "garantia", "manutencao_preventiva", "precos"],
        qualificationQuestions: [
          "Marca/modelo/ano do veículo?",
          "Placa (para histórico)?",
          "Qual serviço precisa (revisão, freio, suspensão, motor, elétrica)?",
          "Quilometragem atual?",
          "Já fez orçamento em outro lugar?",
          "Prefere peças originais ou paralelas?",
        ],
      },
      RETAIL: {
        leadFields: ["product_category", "size", "color", "budget", "occasion"],
        dealFields: ["product_sku", "quantity", "discount_percent", "delivery_method"],
        pipelineStages: [
          { name: "Novo Lead", order: 1, color: "#3b82f6" },
          { name: "Interesse", order: 2, color: "#8b5cf6" },
          { name: "Carrinho/Orçamento", order: 3, color: "#f59e0b" },
          { name: "Pagamento", order: 4, color: "#06b6d4" },
          { name: "Enviado/Entregue ✓", order: 5, color: "#22c55e", isWon: true },
          { name: "Cancelado", order: 6, color: "#ef4444", isLost: true },
        ],
        templates: {
          boas_vindas: "Oi {{lead.name}}! 👋 Sou da {{tenant.name}}. Vi que você procura {{lead.verticalData.product_category}}. Qual tamanho/cor prefere?",
          carrinho: "Seu carrinho está esperando! 🛍️ {{deal.verticalData.quantity}}x {{deal.verticalData.product_sku}} - Total: R$ {{deal.value}}. Finaliza agora?",
          entrega: "Pedido confirmado! 📦 {{deal.verticalData.quantity}}x {{deal.verticalData.product_sku}} a caminho. Rastreio: {{deal.verticalData.tracking_code}}",
        },
        kbCategories: ["produtos", "trocas", "entregas", "promocoes", "tamanhos"],
        qualificationQuestions: [
          "Categoria do produto?",
          "Tamanho (P, M, G, GG, numérico)?",
          "Cor preferida?",
          "Orçamento aproximado?",
          "É para presente/ocasião especial?",
        ],
      },
    };

    return configs[vertical || 'CUSTOM'] || {};
  }
}