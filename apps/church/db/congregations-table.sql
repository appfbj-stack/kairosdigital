-- ═══════════════════════════════════════════
-- KAIROS — Tabela Congregações + Dados
-- Cole no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/vdapmybqeeggkcforyoa/sql/new
-- ═══════════════════════════════════════════

-- 1. CRIAR TABELA
CREATE TABLE IF NOT EXISTS congregations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL,
  name TEXT NOT NULL,
  pastor_name TEXT NOT NULL,
  pastor_email TEXT,
  pastor_phone TEXT,
  patrimonio TEXT,
  member_count INTEGER NOT NULL DEFAULT 0,
  address TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL DEFAULT 'system'
);

-- 2. CHURCH (se ainda não existe)
INSERT INTO churches (id, name, slug, plan, active_modules)
VALUES ('00000000-0000-0000-0000-000000000001', 'Ministério Nova Vida', 'nova-vida', 'pro', '{"members","cells","events","finance","ministries","prayer","sermons","chat","congregations"}')
ON CONFLICT (slug) DO NOTHING;

-- 3. DADOS DE EXEMPLO
INSERT INTO congregations (id, church_id, name, pastor_name, pastor_email, pastor_phone, patrimonio, member_count, address, status) VALUES 
  ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', 'Congregação Central', 'Pr. João Silva', 'pastor@novavida.com.br', '11999990001', 'Templo principal, 2 salas de EBD, equipamento de som e projeção, 1 veículo', 120, 'Av. Principal, 500 — Centro', 'active'),
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Congregação Jardim', 'Pr. Carlos Mendes', 'carlos@novavida.com.br', '11999990005', 'Salão alugado, equipamento básico de som, 10 cadeiras', 45, 'Rua das Flores, 250 — Jardim América', 'active'),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Congregação Horizonte', 'Pr. Pedro Oliveira', 'pedro@novavida.com.br', '11999990003', 'Terreno próprio, templo em construção, tenda provisória', 35, 'Estrada do Sol, km 5 — Horizonte Azul', 'active')
ON CONFLICT DO NOTHING;

-- 4. VERIFICAR
SELECT COUNT(*) AS total_congregations FROM congregations;
SELECT id, name, pastor_name, member_count FROM congregations ORDER BY name;
