import { PrismaClient, PlanTier, UserRole, SubscriptionStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Kairos Digital database...");

  // ----- Plans -----
  const plans = [
    {
      tier: PlanTier.BASIC,
      name: "Básico",
      priceMonthly: 97,
      maxUsers: 3,
      maxWhatsApps: Number(process.env.PLAN_BASIC_WHATSAPP) || 2,
      maxAiMessages: Number(process.env.PLAN_BASIC_AI_MESSAGES) || 1500,
      maxContacts: 5000,
      maxAutomations: 10,
      features: { chatIa: true, crm: true, agenda: true, automations: true },
    },
    {
      tier: PlanTier.PRO,
      name: "Pro",
      priceMonthly: 297,
      maxUsers: 10,
      maxWhatsApps: Number(process.env.PLAN_PRO_WHATSAPP) || 5,
      maxAiMessages: Number(process.env.PLAN_PRO_AI_MESSAGES) || 3500,
      maxContacts: 25000,
      maxAutomations: 50,
      features: { chatIa: true, crm: true, agenda: true, automations: true, agents: true },
    },
    {
      tier: PlanTier.BUSINESS,
      name: "Business",
      priceMonthly: 697,
      maxUsers: 30,
      maxWhatsApps: Number(process.env.PLAN_BUSINESS_WHATSAPP) || 10,
      maxAiMessages: Number(process.env.PLAN_BUSINESS_AI_MESSAGES) || 10000,
      maxContacts: 100000,
      maxAutomations: 200,
      features: { chatIa: true, crm: true, agenda: true, automations: true, agents: true, api: true },
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { tier: plan.tier },
      update: plan,
      create: plan,
    });
  }
  console.log(`✅ ${plans.length} planos criados/atualizados`);

  // ----- Super Admin -----
  const superEmail = process.env.SUPERADMIN_EMAIL || "admin@hermes.local";
  const superPass = process.env.SUPERADMIN_PASSWORD || "ChangeMe123!";
  const superName = process.env.SUPERADMIN_NAME || "Super Admin";

  const passwordHash = await bcrypt.hash(superPass, 12);

  const superadmin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: null as any, email: superEmail } },
    update: {},
    create: {
      email: superEmail,
      passwordHash,
      name: superName,
      role: UserRole.SUPERADMIN,
      emailVerifiedAt: new Date(),
    },
  }).catch(async () => {
    return prisma.user.create({
      data: {
        email: superEmail,
        passwordHash,
        name: superName,
        role: UserRole.SUPERADMIN,
        emailVerifiedAt: new Date(),
      },
    });
  });
  console.log(`✅ Super admin: ${superadmin.email}`);

  // ----- Demo tenant -----
  const basicPlan = await prisma.plan.findUnique({ where: { tier: PlanTier.BASIC } });
  if (!basicPlan) throw new Error("Plano BASIC não encontrado");

  const demoTenant = await prisma.tenant.upsert({
    where: { slug: "demo" },
    update: {},
    create: {
      slug: "demo",
      name: "Empresa Demo",
      subscription: {
        create: {
          planId: basicPlan.id,
          status: SubscriptionStatus.TRIAL,
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    },
  });

  const ownerHash = await bcrypt.hash(superPass, 12);
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: demoTenant.id, email: superEmail } },
    update: {},
    create: {
      tenantId: demoTenant.id,
      email: superEmail,
      passwordHash: ownerHash,
      name: superName,
      role: UserRole.OWNER,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.pipeline.upsert({
    where: { id: `${demoTenant.id}-default` },
    update: {},
    create: {
      id: `${demoTenant.id}-default`,
      tenantId: demoTenant.id,
      name: "Vendas",
      isDefault: true,
      stages: {
        create: [
          { name: "Lead", order: 0, color: "#94a3b8", probability: 10 },
          { name: "Contato feito", order: 1, color: "#3b82f6", probability: 30 },
          { name: "Proposta enviada", order: 2, color: "#f59e0b", probability: 60 },
          { name: "Negociação", order: 3, color: "#a855f7", probability: 80 },
          { name: "Fechado", order: 4, color: "#10b981", probability: 100 },
        ],
      },
    },
  });

  console.log(`✅ Tenant demo: ${demoTenant.slug}`);

  // ----- Demo Appointments -----
  const now = new Date();
  const appointments = [
    {
      tenantId: demoTenant.id,
      title: "Reunião com Lead - João Silva",
      description: "Apresentar proposta comercial",
      startAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      location: "Escritório",
      status: "SCHEDULED",
    },
    {
      tenantId: demoTenant.id,
      title: "Follow-up Cliente Maria",
      description: "Verificar satisfação com o produto",
      startAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      location: "Online",
      status: "SCHEDULED",
    },
    {
      tenantId: demoTenant.id,
      title: "Demonstração do Produto",
      description: "Demo para lead qualificado",
      startAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000),
      meetingUrl: "https://meet.kairosdigital.com/demo",
      status: "SCHEDULED",
    },
    {
      tenantId: demoTenant.id,
      title: "Reunião de Planejamento",
      description: "Planejamento semanal da equipe",
      startAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000),
      location: "Sala 301",
      status: "SCHEDULED",
    },
    {
      tenantId: demoTenant.id,
      title: "Ligação com Parceiro",
      description: "Alinhar estratégia de parceria",
      startAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 14 * 60 * 60 * 1000 + 45 * 60 * 1000),
      status: "SCHEDULED",
    },
  ];

  for (const apt of appointments) {
    await prisma.appointment.create({ data: apt });
  }
  console.log(`✅ ${appointments.length} agendamentos demo criados`);

  console.log("🎉 Seed completo");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
