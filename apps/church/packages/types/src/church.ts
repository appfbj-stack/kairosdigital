export interface Church {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "starter" | "pro" | "enterprise";
  activeModules: string[];
  branding: ChurchBranding;
  customDomain: string | null;
  createdAt: string;
}

export interface ChurchBranding {
  primaryColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
}

export const PLAN_LIMITS = {
  free: { members: 50, storage: "500MB", modules: ["members", "prayer"] },
  starter: { members: 300, storage: "5GB", modules: ["members", "cells", "prayer", "events"] },
  pro: { members: 1000, storage: "20GB", modules: "all" },
  enterprise: { members: Infinity, storage: "unlimited", modules: "all" },
} as const;
