import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";

const ALGORITHM = "aes-256-gcm";
const KEY = scryptSync(env.JWT_SECRET, "hermes-meli-salt", 32);
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function encrypt(text: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

function decrypt(encoded: string): string {
  const buf = Buffer.from(encoded, "base64");
  const iv = buf.subarray(0, IV_LENGTH);
  const authTag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final("utf8");
}

export interface MeliTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: number;
  scopes: string[];
}

function buildAuthUrl(tenantId: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: env.MERCADOLIVRE_APP_ID,
    redirect_uri: env.MERCADOLIVRE_REDIRECT_URI,
    state: tenantId,
  });
  return `https://auth.mercadolivre.com.br/authorization?${params.toString()}`;
}

async function exchangeCode(code: string): Promise<MeliTokens> {
  const resp = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: env.MERCADOLIVRE_APP_ID,
      client_secret: env.MERCADOLIVRE_CLIENT_SECRET,
      code,
      redirect_uri: env.MERCADOLIVRE_REDIRECT_URI,
    }).toString(),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(`Mercado Livre OAuth error: ${resp.status} ${JSON.stringify(err)}`);
  }

  const data = await resp.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    userId: data.user_id,
    scopes: (data.scope ?? "").split(" ").filter(Boolean),
  };
}

async function refreshAccessToken(refreshToken: string): Promise<MeliTokens> {
  const resp = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: env.MERCADOLIVRE_APP_ID,
      client_secret: env.MERCADOLIVRE_CLIENT_SECRET,
      refresh_token: refreshToken,
    }).toString(),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(`Mercado Livre refresh error: ${resp.status} ${JSON.stringify(err)}`);
  }

  const data = await resp.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    userId: data.user_id,
    scopes: (data.scope ?? "").split(" ").filter(Boolean),
  };
}

export const mercadolivreService = {
  encrypt,
  decrypt,

  getAuthUrl(tenantId: string): string {
    return buildAuthUrl(tenantId);
  },

  async handleCallback(tenantId: string, code: string): Promise<{
    meliUserId: number;
    meliNickname?: string;
  }> {
    const tokens = await exchangeCode(code);

    const nickResp = await fetch(`https://api.mercadolibre.com/users/${tokens.userId}`, {
      headers: { Authorization: `Bearer ${tokens.accessToken}` },
    });
    const userData = await nickResp.json().catch(() => ({}));
    const nickname = userData?.nickname ?? null;

    await prisma.mercadoLivreIntegration.upsert({
      where: { tenantId },
      create: {
        tenantId,
        meliUserId: BigInt(tokens.userId),
        meliNickname: nickname,
        accessToken: encrypt(tokens.accessToken),
        refreshToken: encrypt(tokens.refreshToken),
        tokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
        scopes: tokens.scopes,
        isConnected: true,
        connectedAt: new Date(),
      },
      update: {
        meliUserId: BigInt(tokens.userId),
        meliNickname: nickname,
        accessToken: encrypt(tokens.accessToken),
        refreshToken: encrypt(tokens.refreshToken),
        tokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
        scopes: tokens.scopes,
        isConnected: true,
        connectedAt: new Date(),
      },
    });

    return { meliUserId: tokens.userId, meliNickname: nickname };
  },

  async getAccessToken(tenantId: string): Promise<string> {
    const integration = await prisma.mercadoLivreIntegration.findUnique({
      where: { tenantId },
    });

    if (!integration || !integration.isConnected) {
      throw new Error("Tenant nao possui integracao ativa com Mercado Livre");
    }

    if (new Date() < integration.tokenExpiresAt) {
      return decrypt(integration.accessToken);
    }

    try {
      const tokens = await refreshAccessToken(decrypt(integration.refreshToken));
      await prisma.mercadoLivreIntegration.update({
        where: { tenantId },
        data: {
          accessToken: encrypt(tokens.accessToken),
          refreshToken: encrypt(tokens.refreshToken),
          tokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
          scopes: tokens.scopes,
          lastSyncAt: new Date(),
        },
      });
      return tokens.accessToken;
    } catch (err) {
      await prisma.mercadoLivreIntegration.update({
        where: { tenantId },
        data: { isConnected: false },
      });
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      throw new Error(`Falha ao renovar token do Mercado Livre: ${message}. E necessario reconectar.`);
    }
  },

  async getStatus(tenantId: string) {
    const integration = await prisma.mercadoLivreIntegration.findUnique({
      where: { tenantId },
    });
    if (!integration) return { connected: false };
    return {
      connected: integration.isConnected,
      meliUserId: integration.meliUserId.toString(),
      meliNickname: integration.meliNickname,
      tokenExpiresAt: integration.tokenExpiresAt,
      scopes: integration.scopes,
      connectedAt: integration.connectedAt,
    };
  },

  async disconnect(tenantId: string) {
    await prisma.mercadoLivreIntegration.updateMany({
      where: { tenantId },
      data: { isConnected: false },
    });
  },
};
