// Only works in browser — guard server-side
const isBrowser = typeof window !== "undefined" && typeof indexedDB !== "undefined";

import type { IDBPDatabase } from "idb";

const DB_NAME = "kairos-local";
const DB_VERSION = 2;

const TABLES = [
  "churches", "users", "members", "cells", "events",
  "transactions", "prayer_requests", "sermons", "chat_rooms",
  "messages", "ministries", "congregations"
];

let dbPromise: Promise<IDBPDatabase | null> | null = null;

async function getDB() {
  if (!isBrowser) return null;
  if (dbPromise) return dbPromise;
  const { openDB } = await import("idb");
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      for (const table of TABLES) {
        if (!db.objectStoreNames.contains(table)) {
          const store = db.createObjectStore(table, { keyPath: "id" });
          if (table !== "churches") {
            try { store.createIndex("church_id", "church_id"); } catch {}
          }
        }
      }
      // Seed new tables if they were just created
      if (db.objectStoreNames.contains("congregations")) {
        // Check if already seeded
        const tx = (db as any).transaction;
        // Will be seeded below in seedIfEmpty
      }
    },
  });
  return dbPromise;
}

// Seed inicial de dados
async function seedIfEmpty() {
  if (!isBrowser) return;
  const db = await getDB();
  if (!db) return;
  const count = await db.count("churches");
  if (count > 0) return;

  const tx = db.transaction(TABLES, "readwrite");

  await tx.store.put({ id: "church-001", name: "Ministério Nova Vida", slug: "nova-vida", plan: "pro", active_modules: '["members","cells","events","finance","ministries","prayer","sermons","chat"]', custom_domain: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), created_by: "system" });

  await tx.store.put({ id: "user-super", church_id: "church-001", email: "admin@novavida.com.br", name: "Admin Nova Vida", avatar_url: null, role: "super_admin", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), created_by: "system" });
  await tx.store.put({ id: "user-pastor", church_id: "church-001", email: "pastor@novavida.com.br", name: "Pastor João Silva", avatar_url: null, role: "pastor", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), created_by: "user-super" });
  await tx.store.put({ id: "user-lider", church_id: "church-001", email: "lider@novavida.com.br", name: "Maria Santos", avatar_url: null, role: "leader", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), created_by: "user-super" });

  await tx.store.put({ id: "mem-001", church_id: "church-001", user_id: "user-pastor", name: "Pastor João Silva", email: "pastor@novavida.com.br", phone: "11999990001", birthdate: "1980-03-15", baptism_date: "1995-01-10", status: "active", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), created_by: "user-super" });
  await tx.store.put({ id: "mem-002", church_id: "church-001", user_id: "user-lider", name: "Maria Santos", email: "lider@novavida.com.br", phone: "11999990002", birthdate: "1985-07-22", baptism_date: "2005-03-20", status: "active", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), created_by: "user-super" });
  await tx.store.put({ id: "mem-003", church_id: "church-001", user_id: null, name: "Pedro Oliveira", email: "pedro@email.com", phone: "11999990003", birthdate: "1990-01-10", baptism_date: "2020-06-15", status: "active", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), created_by: "user-super" });
  await tx.store.put({ id: "mem-004", church_id: "church-001", user_id: null, name: "Ana Costa", email: "ana@email.com", phone: "11999990004", birthdate: "1992-05-05", baptism_date: "2021-02-28", status: "active", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), created_by: "user-super" });

  await tx.store.put({ id: "cell-001", church_id: "church-001", name: "Célula Central", leader_id: "mem-002", meeting_day: "Quarta-feira", meeting_time: "19:30", address: "Rua das Flores, 100", active: 1, created_at: new Date().toISOString(), created_by: "user-super" });

  await tx.store.put({ id: "min-001", church_id: "church-001", name: "Louvor", description: "Ministério de Música", leader_id: "mem-001", color: "#6366f1", icon: "Music", active: 1, created_at: new Date().toISOString(), created_by: "user-super" });
  await tx.store.put({ id: "min-002", church_id: "church-001", name: "Jovens", description: "Ministério de Juventude", leader_id: "mem-002", color: "#ec4899", icon: "Star", active: 1, created_at: new Date().toISOString(), created_by: "user-super" });

  await tx.store.put({ id: "evt-001", church_id: "church-001", title: "Culto de Domingo", description: "Culto principal", start_at: "2026-07-19T09:00:00", end_at: "2026-07-19T11:00:00", type: "service", location: "Templo Principal", created_at: new Date().toISOString(), created_by: "user-super" });
  await tx.store.put({ id: "evt-002", church_id: "church-001", title: "Retiro Espiritual", description: "Retiro de fim de semana", start_at: "2026-08-15T08:00:00", type: "retreat", location: "Chácara Monte Sião", created_at: new Date().toISOString(), created_by: "user-super" });

  await tx.store.put({ id: "txn-001", church_id: "church-001", type: "income", category: "Dízimo", amount: 1500, description: "Dízimo mensal", date: "2026-07-01", payment_method: "pix", created_at: new Date().toISOString(), created_by: "user-super" });
  await tx.store.put({ id: "txn-002", church_id: "church-001", type: "income", category: "Oferta", amount: 500, description: "Oferta domingo", date: "2026-07-05", payment_method: "cash", created_at: new Date().toISOString(), created_by: "user-super" });
  await tx.store.put({ id: "txn-003", church_id: "church-001", type: "expense", category: "Aluguel", amount: -2000, description: "Aluguel do templo", date: "2026-07-01", payment_method: "transfer", created_at: new Date().toISOString(), created_by: "user-super" });

  await tx.store.put({ id: "pry-001", church_id: "church-001", member_id: "mem-003", title: "Cura da minha mãe", description: "Minha mãe está internada com pneumonia.", status: "open", is_anonymous: 0, created_at: new Date().toISOString(), created_by: "user-super" });

  await tx.store.put({ id: "srm-001", church_id: "church-001", title: "A Fé que Move Montanhas", pastor_id: "mem-001", series: "Heróis da Fé", scripture: "Hebreus 11:1-6", preached_at: "2026-07-05", created_at: new Date().toISOString(), created_by: "user-super" });

  await tx.store.put({ id: "room-001", church_id: "church-001", name: "Geral", type: "general", created_at: new Date().toISOString(), created_by: "user-super" });

  await tx.store.put({ id: "msg-001", church_id: "church-001", room_id: "room-001", sender_id: "user-pastor", content: "Bom dia, igreja! Que Deus abençoe a semana de todos.", type: "text", created_at: new Date().toISOString(), created_by: "user-super" });

  // Congregations seed
  await tx.store.put({ id: "cong-001", church_id: "church-001", name: "Congregação Central", pastor_name: "Pr. João Silva", pastor_email: "pastor@novavida.com.br", pastor_phone: "11999990001", patrimonio: "Templo principal, 2 salas de EBD, equipamento de som e projeção", member_count: 120, address: "Av. Principal, 500 — Centro", status: "active", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), created_by: "user-super" });
  await tx.store.put({ id: "cong-002", church_id: "church-001", name: "Congregação Jardim", pastor_name: "Pr. Carlos Mendes", pastor_email: "carlos@novavida.com.br", pastor_phone: "11999990005", patrimonio: "Salão alugado, equipamento básico de som", member_count: 45, address: "Rua das Flores, 250 — Jardim América", status: "active", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), created_by: "user-super" });

  await tx.done;
  console.log("[IndexedDB] Banco local seedado com sucesso.");
}

seedIfEmpty();

// Seed congregations if table was just created (DB version bump)
async function seedCongregations() {
  const db = await getDB();
  if (!db) return;
  const count = await db.count("congregations");
  if (count > 0) return;
  const tx = db.transaction("congregations", "readwrite");
  await tx.store.put({ id: "cong-001", church_id: "church-001", name: "Congregação Central", pastor_name: "Pr. João Silva", pastor_email: "pastor@novavida.com.br", pastor_phone: "11999990001", patrimonio: "Templo principal, 2 salas de EBD, equipamento de som e projeção, 1 veículo", member_count: 120, address: "Av. Principal, 500 — Centro", status: "active", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), created_by: "user-super" });
  await tx.store.put({ id: "cong-002", church_id: "church-001", name: "Congregação Jardim", pastor_name: "Pr. Carlos Mendes", pastor_email: "carlos@novavida.com.br", pastor_phone: "11999990005", patrimonio: "Salão alugado, equipamento básico de som, 10 cadeiras", member_count: 45, address: "Rua das Flores, 250 — Jardim América", status: "active", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), created_by: "user-super" });
  await tx.store.put({ id: "cong-003", church_id: "church-001", name: "Congregação Horizonte", pastor_name: "Pr. Pedro Oliveira", pastor_email: "pedro@novavida.com.br", pastor_phone: "11999990003", patrimonio: "Terreno próprio, templo em construção, tenda provisória", member_count: 35, address: "Estrada do Sol, km 5 — Horizonte Azul", status: "active", created_at: new Date().toISOString(), updated_at: new Date().toISOString(), created_by: "user-super" });
  await tx.done;
  console.log("[IndexedDB] Congregações seedadas.");
}
seedCongregations();

// Mock data for server-side rendering
const MOCK_CHURCH = { id: "church-001", name: "Ministério Nova Vida", slug: "nova-vida", plan: "pro", active_modules: '["members","cells","events","finance","ministries","prayer","sermons","chat"]', custom_domain: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), created_by: "system" };

function serverFallback() {
  const q = (data: any = []) => ({
    select() { return this as any; },
    eq() { return this as any; },
    gte() { return this as any; },
    lte() { return this as any; },
    order() { return this as any; },
    limit() { return this as any; },
    single() { return { then: (r: any) => r({ data: Array.isArray(data) ? data[0] || null : data, error: null }) }; },
    then: (r: any) => r({ data, error: null }),
  });
  return {
    from(_t: string) {
      return {
        select() { return q(_t === "churches" ? [MOCK_CHURCH] : []); },
        insert(v: any) { return { then: (r: any) => r({ data: Array.isArray(v) ? v : [v], error: null }) } as any; },
        update() { return { eq() { return { then: (r: any) => r({ data: null, error: null }) } as any } } as any; },
      };
    },
    auth: {
      getSession() { return Promise.resolve({ data: { session: { user: { id: "user-super", email: "admin@novavida.com.br", user_metadata: { name: "Admin", church_id: "church-001", role: "super_admin" } } } }, error: null }); },
      getUser() { return Promise.resolve({ data: { user: { id: "user-super", email: "admin@novavida.com.br", user_metadata: { name: "Admin", church_id: "church-001", role: "super_admin" } } }, error: null }); },
      signInWithPassword(_e: any) { return Promise.resolve({ data: { session: { user: { id: "user-super", email: _e?.email || "", user_metadata: { name: "Admin", church_id: "church-001", role: "super_admin" } } } }, error: null }); },
      signUp() { return Promise.resolve({ data: null, error: null }); },
      signOut() { return Promise.resolve({ error: null }); },
      onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; },
    },
    rpc() { return q([MOCK_CHURCH]) as any; },
    storage: { from() { return { upload(p: string) { return Promise.resolve({ data: { path: p }, error: null }); }, getPublicUrl() { return { data: { publicUrl: "" } }; } }; } },
  };
}

// Query builder que imita Supabase API
export function createLocalSupabase() {
  if (!isBrowser) return serverFallback();

  const from = (table: string) => ({
    select(_cols?: string) {
      return {
        eq(col: string, val: unknown) {
          return {
            order(_c: string) { return this; },
            limit(_n: number) { return this; },
            single() {
              return {
                then: async (resolve: any) => {
                  try {
                    const db = await getDB();
                    if (!db) return resolve({ data: null, error: null });
                    const all = await db.getAll(table);
                    let filtered = all.filter((r: any) => r[col] === val);
                    resolve({ data: filtered[0] || null, error: null });
                  } catch (e) { resolve({ data: null, error: e }); }
                },
              };
            },
            then: async (resolve: any) => {
              try {
                const db = await getDB();
                if (!db) return resolve({ data: [], error: null });
                const all = await db.getAll(table);
                let filtered = all.filter((r: any) => r[col] === val);
                resolve({ data: filtered, error: null });
              } catch (e) { resolve({ data: [], error: e }); }
            },
          };
        },
        gte(col: string, val: unknown) {
          return {
            order(_c: string) { return this; },
            then: async (resolve: any) => {
              try {
                const db = await getDB();
                if (!db) return resolve({ data: [], error: null });
                const all = await db.getAll(table);
                let filtered = all.filter((r: any) => r[col] >= val);
                resolve({ data: filtered, error: null });
              } catch (e) { resolve({ data: [], error: e }); }
            },
          };
        },
        then: async (resolve: any) => {
          try {
            const db = await getDB();
            if (!db) return resolve({ data: [], error: null });
            const all = await db.getAll(table);
            resolve({ data: all, error: null });
          } catch (e) { resolve({ data: [], error: e }); }
        },
      };
    },
    insert(values: any) {
      const promise = (async () => {
        try {
          const db = await getDB();
          if (!db) return { data: [], error: new Error("DB not available") };
          const rows = Array.isArray(values) ? values : [values];
          for (const row of rows) await db.put(table, row);
          return { data: rows, error: null };
        } catch (e) { return { data: null, error: e as Error }; }
      })();
      return {
        then: (onFulfilled: any, onRejected?: any) => promise.then(onFulfilled, onRejected),
        catch: (onRejected: any) => promise.catch(onRejected),
        select() { return promise; },
        single() { return promise; },
      };
    },
    update(values: any) {
      return {
        eq(col: string, val: unknown) {
          return {
            then: async (resolve: any) => {
              try {
                const db = await getDB();
                if (!db) return resolve({ data: null, error: null });
                const all = await db.getAll(table);
                const target = all.find((r: any) => r[col] === val);
                if (target) {
                  const updated = { ...target, ...values };
                  await db.put(table, updated);
                }
                resolve({ data: null, error: null });
              } catch (e) { resolve({ data: null, error: e }); }
            },
          };
        },
      };
    },
  });

  return {
    from,
    auth: {
      getSession() { return Promise.resolve({ data: { session: { user: { id: "user-super", email: "admin@novavida.com.br", user_metadata: { name: "Admin", church_id: "church-001", role: "super_admin" } } } }, error: null }); },
      getUser() { return Promise.resolve({ data: { user: { id: "user-super", email: "admin@novavida.com.br", user_metadata: { name: "Admin", church_id: "church-001", role: "super_admin" } } }, error: null }); },
      signInWithPassword({ email }: { email: string }) { return Promise.resolve({ data: { session: { user: { id: "user-super", email, user_metadata: { name: "Admin", church_id: "church-001", role: "super_admin" } } } }, error: null }); },
      signUp() { return Promise.resolve({ data: null, error: null }); },
      signOut() { return Promise.resolve({ error: null }); },
      onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; },
    },
    rpc() { return { then: async (resolve: any) => { try { const db = await getDB(); if (!db) return resolve({ data: MOCK_CHURCH, error: null }); const all = await db.getAll("churches"); resolve({ data: all[0] || null, error: null }); } catch (e) { resolve({ data: null, error: e }); } } }; },
    storage: { from() { return { upload(p: string) { return Promise.resolve({ data: { path: p }, error: null }); }, getPublicUrl() { return { data: { publicUrl: "" } }; } }; } },
  };
}
