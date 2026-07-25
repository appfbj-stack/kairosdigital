const { Client } = require('pg');

const SQL = `
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

INSERT INTO congregations (id, church_id, name, pastor_name, pastor_email, pastor_phone, patrimonio, member_count, address, status)
VALUES 
  ('00000000-0000-0000-0000-000000000100', '00000000-0000-0000-0000-000000000001', 'Congregação Central', 'Pr. João Silva', 'pastor@novavida.com.br', '11999990001', 'Templo principal, 2 salas de EBD, equipamento de som e projeção, 1 veículo', 120, 'Av. Principal, 500 — Centro', 'active'),
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Congregação Jardim', 'Pr. Carlos Mendes', 'carlos@novavida.com.br', '11999990005', 'Salão alugado, equipamento básico de som, 10 cadeiras', 45, 'Rua das Flores, 250 — Jardim América', 'active'),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Congregação Horizonte', 'Pr. Pedro Oliveira', 'pedro@novavida.com.br', '11999990003', 'Terreno próprio, templo em construção, tenda provisória', 35, 'Estrada do Sol, km 5 — Horizonte Azul', 'active')
ON CONFLICT DO NOTHING;

SELECT COUNT(*) as count FROM congregations;
`;

async function main() {
  const client = new Client({
    host: 'db.vdapmybqeeggkcforyoa.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'Borges1972@jane',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao Supabase PostgreSQL!');
    
    const result = await client.query(SQL);
    const count = result.rows?.[result.rows.length - 1]?.count;
    console.log(`✅ ${count} congregações na tabela`);
    
    await client.end();
  } catch (e) {
    console.error('❌', e.message);
    process.exit(1);
  }
}

main();
