import { mercadolivreService } from "./mercadolivre.service.js";

const MELI_API = "https://api.mercadolibre.com";

let appTokenCache: { token: string; expiresAt: number } | null = null;

async function getAppToken(): Promise<string> {
  if (appTokenCache && Date.now() < appTokenCache.expiresAt - 60000) {
    return appTokenCache.token;
  }
  const { default: envModule } = await import("../config/env.js");
  const resp = await fetch("https://api.mercadolibre.com/oauth/token", {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: envModule.env.MERCADOLIVRE_APP_ID,
      client_secret: envModule.env.MERCADOLIVRE_CLIENT_SECRET,
    }).toString(),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(`Meli app token error ${resp.status}: ${JSON.stringify(err)}`);
  }
  const data = (await resp.json()) as { access_token: string; expires_in: number };
  appTokenCache = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return data.access_token;
}

async function publicFetch(path: string): Promise<unknown> {
  const token = await getAppToken();
  const resp = await fetch(`${MELI_API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(`Mercado Livre API error ${resp.status}: ${JSON.stringify(err)}`);
  }
  return resp.json();
}

async function meliFetch(tenantId: string, path: string, options: RequestInit = {}): Promise<unknown> {
  const token = await mercadolivreService.getAccessToken(tenantId);
  const resp = await fetch(`${MELI_API}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(`Mercado Livre API error ${resp.status}: ${JSON.stringify(err)}`);
  }
  return resp.json();
}

export interface CreateProductInput {
  title: string;
  category_id: string;
  price: number;
  available_quantity: number;
  currency_id?: string;
  description?: string;
  pictures?: Array<{ source: string }>;
  attributes?: Array<{ id: string; value_name?: string; value_id?: string }>;
}

export interface UpdateProductInput {
  price?: number;
  available_quantity?: number;
  description?: string;
}

export interface ProductMetrics {
  itemId: string;
  title?: string;
  visits?: unknown;
  health?: unknown;
}

export interface OrderItem {
  id: string;
  status: string;
  date_created: string;
  total_amount: number;
  currency_id: string;
  buyer?: { nickname: string };
  order_items?: Array<{ item: { id: string; title: string }; quantity: number; unit_price: number }>;
}

export const mercadolivreApi = {
  async createProduct(tenantId: string, input: CreateProductInput) {
    return meliFetch(tenantId, "/items", {
      method: "POST",
      body: JSON.stringify({
        ...input,
        currency_id: input.currency_id ?? "BRL",
        buying_mode: "buy_it_now",
        listing_type_id: "gold_special",
        condition: "new",
      }),
    });
  },

  async updateProduct(tenantId: string, itemId: string, input: UpdateProductInput) {
    return meliFetch(tenantId, `/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },

  async getProduct(tenantId: string, itemId: string) {
    return meliFetch(tenantId, `/items/${itemId}`);
  },

  async getProductMetrics(tenantId: string, itemId: string): Promise<ProductMetrics> {
    const [visits, health] = await Promise.all([
      meliFetch(tenantId, `/items/${itemId}/visits`).catch(() => null),
      meliFetch(tenantId, `/items/${itemId}/health`).catch(() => null),
    ]);
    return { itemId, visits, health };
  },

  async listOrders(tenantId: string, days = 30): Promise<OrderItem[]> {
    const integration = await import("./mercadolivre.service.js").then((m) =>
      m.mercadolivreService.getStatus(tenantId)
    );
    const from = new Date();
    from.setDate(from.getDate() - days);
    const params = new URLSearchParams({
      seller: String(integration.meliUserId),
      "order.date_created.from": from.toISOString().split("T")[0],
      sort: "date_desc",
    });
    const data = (await meliFetch(tenantId, `/orders/search?${params.toString()}`)) as {
      results: OrderItem[];
    };
    return data.results ?? [];
  },

  async getCategories(tenantId: string) {
    return meliFetch(tenantId, "/sites/MLB/categories");
  },

  async searchProducts(query: string, limit = 20, category?: string) {
    const params = new URLSearchParams({ q: query, limit: String(limit) });
    if (category) params.set("category", category);
    const data = (await publicFetch(`/sites/MLB/search?${params.toString()}`)) as {
      results: Array<{
        id: string;
        title: string;
        price: number;
        sold_quantity: number;
        available_quantity: number;
        currency_id: string;
        condition: string;
        permalink: string;
        seller: { id: number; nickname: string };
      }>;
      paging: { total: number; offset: number; limit: number };
    };
    return {
      total: data.paging?.total ?? 0,
      results: (data.results ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        price: r.price,
        soldQuantity: r.sold_quantity ?? 0,
        availableQuantity: r.available_quantity ?? 0,
        currency: r.currency_id,
        condition: r.condition,
        permalink: r.permalink,
        sellerId: r.seller?.id,
        sellerNickname: r.seller?.nickname,
      })),
    };
  },

  async analyzeCompetitor(sellerId: number) {
    const data = (await publicFetch(`/sites/MLB/search?seller_id=${sellerId}&limit=50`)) as {
      results: Array<{
        id: string;
        title: string;
        price: number;
        sold_quantity: number;
        available_quantity: number;
        currency_id: string;
        category_id: string;
        condition: string;
        listing_type_id: string;
      }>;
      paging: { total: number };
      seller: { id: number; nickname: string; seller_reputation?: { power_seller_status?: string } };
    };

    const items = (data.results ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      price: r.price,
      soldQuantity: r.sold_quantity ?? 0,
      availableQuantity: r.available_quantity ?? 0,
      currency: r.currency_id,
      categoryId: r.category_id,
    }));

    const totalSold = items.reduce((sum, i) => sum + i.soldQuantity, 0);
    const avgPrice = items.length > 0 ? items.reduce((sum, i) => sum + i.price, 0) / items.length : 0;
    const topProducts = [...items].sort((a, b) => b.soldQuantity - a.soldQuantity).slice(0, 10);

    return {
      sellerId,
      sellerNickname: data.seller?.nickname ?? "desconhecido",
      reputation: data.seller?.seller_reputation?.power_seller_status ?? null,
      totalProducts: data.paging?.total ?? items.length,
      analyzedItems: items.length,
      totalSold,
      avgPrice: Math.round(avgPrice * 100) / 100,
      currency: items[0]?.currency ?? "BRL",
      topProducts,
    };
  },

  async getTrending(categoryId: string) {
    return publicFetch(`/trends/MLB/${categoryId}`);
  },

  async getItemDetail(itemId: string) {
    const data = (await publicFetch(`/items/${itemId}`)) as {
      id: string;
      title: string;
      price: number;
      sold_quantity: number;
      available_quantity: number;
      currency_id: string;
      condition: string;
      permalink: string;
      seller_id: number;
      initial_quantity: number;
    };
    return {
      id: data.id,
      title: data.title,
      price: data.price,
      soldQuantity: data.sold_quantity ?? 0,
      availableQuantity: data.available_quantity ?? 0,
      initialQuantity: data.initial_quantity ?? 0,
      sellThroughRate: data.initial_quantity > 0
        ? Math.round((data.sold_quantity / data.initial_quantity) * 100)
        : 0,
      currency: data.currency_id,
      condition: data.condition,
      sellerId: data.seller_id,
      permalink: data.permalink,
    };
  },
};
