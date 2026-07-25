import { PrismaClient, Vertical } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed...");

  // 1. Tenant Demo - Imobiliária
  const imobPassword = await bcrypt.hash("demo123", 10);
  const imob = await prisma.tenant.upsert({
    where: { slug: "demo-imobiliaria" },
    update: {},
    create: {
      slug: "demo-imobiliaria",
      name: "Imobiliária Demo Ltda",
      tradeName: "Demo Imóveis",
      vertical: "REAL_ESTATE",
      primaryColor: "#1e40af",
      secondaryColor: "#1e3a8a",
      welcomeMsg: "Bem-vindo à Demo Imóveis! 🏠 Como posso ajudar?",
      verticalConfig: {
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
          boas_vindas: "Oi {{lead.name}}! 👋 Sou o assistente da {{tenant.name}}. Vi que você busca {{lead.customData.property_type}} na região de {{lead.customData.location}}. Qual seu orçamento aproximado?",
          agendamento_visita: "Perfeito! Temos {{lead.customData.property_type}} lindos no seu perfil. Que dia/hora prefere visitar? 🗓️",
          proposta: "Olá {{lead.name}}, sua proposta para o imóvel {{deal.customData.property_id}} de R$ {{deal.value}} foi enviada. Aguardamos retorno! 📝",
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
      users: {
        create: {
          name: "João Corretor",
          email: "joao@demoimoveis.com",
          passwordHash: imobPassword,
          role: "OWNER",
        },
      },
    },
  });
  console.log("✅ Tenant imobiliária criado:", imob.slug);

  // 2. Tenant Demo - Mecânica
  const mecPassword = await bcrypt.hash("demo123", 10);
  const mec = await prisma.tenant.upsert({
    where: { slug: "demo-mecanica" },
    update: {},
    create: {
      slug: "demo-mecanica",
      name: "Auto Center Demo Ltda",
      tradeName: "Demo Auto Center",
      vertical: "AUTOMOTIVE",
      primaryColor: "#dc2626",
      secondaryColor: "#991b1b",
      welcomeMsg: "Olá! 🔧 Sou o assistente do Demo Auto Center. Como posso ajudar seu carro hoje?",
      verticalConfig: {
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
          boas_vindas: "Oi {{lead.name}}! 🔧 Sou do {{tenant.name}}. Vi que seu {{lead.customData.vehicle_brand}} {{lead.customData.vehicle_model}} ({{lead.customData.vehicle_year}}) precisa de {{lead.customData.service_type}}. Qual a quilometragem atual?",
          orcamento: "Orçamento pronto para {{lead.customData.vehicle_brand}} {{lead.customData.vehicle_model}}:
{{deal.customData.service_items}}
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
      users: {
        create: {
          name: "Carlos Mecânico",
          email: "carlos@demoauto.com",
          passwordHash: mecPassword,
          role: "OWNER",
        },
      },
    },
  });
  console.log("✅ Tenant mecânica criado:", mec.slug);

  // 3. Tenant Demo - Varejo
  const retPassword = await bcrypt.hash("demo123", 10);
  const ret = await prisma.tenant.upsert({
    where: { slug: "demo-loja" },
    update: {},
    create: {
      slug: "demo-loja",
      name: "Loja Demo Fashion Ltda",
      tradeName: "Demo Fashion",
      vertical: "RETAIL",
      primaryColor: "#7c3aed",
      secondaryColor: "#5b21b6",
      welcomeMsg: "Oi! 👋 Bem-vindo à Demo Fashion! Como posso te ajudar nas compras hoje?",
      verticalConfig: {
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
          boas_vindas: "Oi {{lead.name}}! 👋 Sou da {{tenant.name}}. Vi que você procura {{lead.customData.product_category}}. Qual tamanho/cor prefere?",
          carrinho: "Seu carrinho está esperando! 🛍️ {{deal.customData.quantity}}x {{deal.customData.product_sku}} - Total: R$ {{deal.value}}. Finaliza agora?",
          entrega: "Pedido confirmado! 📦 {{deal.customData.quantity}}x {{deal.customData.product_sku}} a caminho. Rastreio: {{deal.customData.tracking_code}}",
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
      users: {
        create: {
          name: "Maria Vendedora",
          email: "maria@demofashion.com",
          passwordHash: retPassword,
          role: "OWNER",
        },
      },
    },
  });
  console.log("✅ Tenant varejo criado:", ret.slug);

  // 4. Knowledge Base de exemplo para imobiliária
  await prisma.knowledgeBase.createMany({
    data: [
      { tenantId: imob.id, title: "Como funciona financiamento imobiliário", content: "O financiamento imobiliário permite parcelar o imóvel em até 35 anos. Principais modalidades: SFH (até R$ 1,5mi, usa FGTS), SFI (acima, não usa FGTS). Taxas a partir de 8,99% a.a. + TR. Documentos: RG, CPF, comprovante renda, residência.", tags: ["financiamento", "documentacao"], metadata: { category: "financiamento" } },
      { tenantId: imob.id, title: "Documentos para compra de imóvel", content: "Comprador: RG, CPF, certidão nascimento/casamento, comprovante renda, residência, declaração IR. Vendedor: matrícula atualizada, certidões negativas (federal, estadual, municipal, trabalhista, interdição/tutela), IPTU quitado, condomínio quitado.", tags: ["documentacao", "compra"], metadata: { category: "documentacao" } },
      { tenantId: imob.id, title: "Bairros nobres da cidade", content: "Jardins: alto padrão, comércio forte, metrô. Vila Madalena: boêmio, cultural, valorização. Moema: plano, parques, infraestrutura. Itaim Bibi: corporativo, restaurantes, alto ticket. Pinheiros: misto, tech, mobilidade.", tags: ["bairros", "localizacao"], metadata: { category: "bairros" } },
    ],
    skipDuplicates: true,
  });
  console.log("✅ Knowledge base populada");

  console.log("\n🎉 Seed concluído!");
  console.log("📋 Tenants criados:");
  console.log("   - demo-imobiliaria (senha: demo123)");
  console.log("   - demo-mecanica (senha: demo123)");
  console.log("   - demo-loja (senha: demo123)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });