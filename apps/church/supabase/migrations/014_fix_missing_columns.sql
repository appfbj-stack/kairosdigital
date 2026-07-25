-- Adiciona colunas faltantes nas tabelas existentes (idempotente)

-- chat_rooms
alter table chat_rooms add column if not exists created_by uuid;
alter table chat_rooms add column if not exists updated_at timestamptz not null default now();

-- messages
alter table messages add column if not exists created_by uuid;
alter table messages add column if not exists updated_at timestamptz not null default now();
alter table messages add column if not exists type text not null default 'text';
alter table messages add column if not exists media_url text;

-- Garante que o RLS usa a função auth_church_id corretamente
-- Re-cria as políticas do chat para garantir que estão corretas
drop policy if exists "chat_rooms_insert" on chat_rooms;
create policy "chat_rooms_insert" on chat_rooms
  for insert with check (
    church_id = auth_church_id()
    and auth_role() in ('church_admin', 'pastor', 'leader', 'super_admin')
  );

drop policy if exists "messages_insert" on messages;
create policy "messages_insert" on messages
  for insert with check (church_id = auth_church_id());

-- Recria super_admin policies para chat
drop policy if exists "chat_rooms_super_admin" on chat_rooms;
create policy "chat_rooms_super_admin" on chat_rooms
  for all using (auth_role() = 'super_admin');

drop policy if exists "messages_super_admin" on messages;
create policy "messages_super_admin" on messages
  for all using (auth_role() = 'super_admin');
