import { prisma } from "../lib/prisma.js";
import {
  hashPassword,
  verifyPassword,
  refreshToken,
  HermesError,
  UnauthorizedError,
  slugify,
} from "@kairosdigital/utils";
import type {
  LoginInput,
  RegisterTenantInput,
} from "@kairosdigital/types";
import { PlanTier, SubscriptionStatus, UserRole } from "@prisma/client";

const REFRESH_TTL_DAYS = 30;

export const authService = {
  async login(input: LoginInput) {
    const where = input.tenantSlug
      ? { tenant: { slug: input.tenantSlug }, email: input.email }
      : { email: input.email };

    const users = await prisma.user.findMany({
      where,
      include: { tenant: true },
    });
    const user = users[0];
    if (!user || !user.isActive) throw new UnauthorizedError("Credenciais inválidas");
    const ok = await verifyPassword(input.password, user.passwordHash);
    if (!ok) throw new UnauthorizedError("Credenciais inválidas");
    if (user.tenant && user.tenant.status !== "ACTIVE") {
      throw new HermesError("TENANT_SUSPENDED", "Tenant suspenso", 403);
    }

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: refreshToken(),
        expiresAt: new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenant: user.tenant ? { id: user.tenant.id, slug: user.tenant.slug, name: user.tenant.name } : null,
      },
      refreshToken: session.refreshToken,
    };
  },

  async refresh(token: string) {
    const session = await prisma.session.findUnique({
      where: { refreshToken: token },
      include: { user: { include: { tenant: true } } },
    });
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedError("Sessão expirada");
    }
    return session.user;
  },

  async logout(token: string) {
    await prisma.session.updateMany({
      where: { refreshToken: token, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  async registerTenant(input: RegisterTenantInput) {
    const slug = slugify(input.tenantSlug);
    const existing = await prisma.tenant.findUnique({ where: { slug } });
    if (existing) throw new HermesError("TENANT_EXISTS", "Slug já em uso", 409);

    const plan = await prisma.plan.findUnique({ where: { tier: input.planTier as PlanTier } });
    if (!plan) throw new HermesError("PLAN_NOT_FOUND", "Plano não encontrado", 404);

    const passwordHash = await hashPassword(input.ownerPassword);

    const tenant = await prisma.tenant.create({
      data: {
        slug,
        name: input.tenantName,
        subscription: {
          create: {
            planId: plan.id,
            status: SubscriptionStatus.TRIAL,
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
        users: {
          create: {
            email: input.ownerEmail,
            name: input.ownerName,
            passwordHash,
            role: UserRole.OWNER,
            emailVerifiedAt: new Date(),
          },
        },
        pipelines: {
          create: {
            name: "Vendas",
            isDefault: true,
            stages: {
              create: [
                { name: "Lead", order: 0, color: "#94a3b8", probability: 10 },
                { name: "Contato feito", order: 1, color: "#3b82f6", probability: 30 },
                { name: "Proposta", order: 2, color: "#f59e0b", probability: 60 },
                { name: "Negociação", order: 3, color: "#a855f7", probability: 80 },
                { name: "Fechado", order: 4, color: "#10b981", probability: 100 },
              ],
            },
          },
        },
      },
      include: { users: true },
    });

    return { tenant, owner: tenant.users[0] };
  },
};
