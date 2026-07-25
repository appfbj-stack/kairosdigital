-- Fix completo das tabelas de chat

-- chat_rooms: garante todas as colunas
alter table chat_rooms add column if not exists name text;
alter table chat_rooms add column if not exists type text not null default 'general';
alter table chat_rooms add column if not exists church_id uuid;
alter table chat_rooms add column if not exists created_by uuid;
alter table chat_rooms add column if not exists created_at timestamptz not null default now();
alter table chat_rooms add column if not exists updated_at timestamptz not null default now();

-- messages: garante todas as colunas necessárias
alter table messages add column if not exists room_id uuid;
alter table messages add column if not exists sender_id uuid;
alter table messages add column if not exists church_id uuid;
alter table messages add column if not exists content text;
alter table messages add column if not exists type text not null default 'text';
alter table messages add column if not exists media_url text;
alter table messages add column if not exists created_by uuid;
alter table messages add column if not exists created_at timestamptz not null default now();
alter table messages add column if not exists updated_at timestamptz not null default now();

-- Habilita RLS se não estiver habilitado
alter table chat_rooms enable row level security;
alter table messages enable row level security;

-- Recria todas as policies do chat (drop + create para garantir)
drop policy if exists "chat_rooms_select" on chat_rooms;
create policy "chat_rooms_select" on chat_rooms
  for select using (church_id = auth_church_id() or auth_role() = 'super_admin');

drop policy if exists "chat_rooms_insert" on chat_rooms;
create policy "chat_rooms_insert" on chat_rooms
  for insert with check (
    church_id = auth_church_id()
    and auth_role() in ('church_admin', 'pastor', 'leader', 'super_admin')
  );

drop policy if exists "chat_rooms_update" on chat_rooms;
create policy "chat_rooms_update" on chat_rooms
  for update using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'super_admin'));

drop policy if exists "chat_rooms_delete" on chat_rooms;
create policy "chat_rooms_delete" on chat_rooms
  for delete using (church_id = auth_church_id() and auth_role() in ('church_admin', 'super_admin'));

drop policy if exists "chat_rooms_super_admin" on chat_rooms;
create policy "chat_rooms_super_admin" on chat_rooms
  for all using (auth_role() = 'super_admin');

-- Messages policies
drop policy if exists "messages_select" on messages;
create policy "messages_select" on messages
  for select using (church_id = auth_church_id() or auth_role() = 'super_admin');

drop policy if exists "messages_insert" on messages;
create policy "messages_insert" on messages
  for insert with check (
    church_id = auth_church_id()
    and sender_id = auth.uid()
  );

drop policy if exists "messages_delete" on messages;
create policy "messages_delete" on messages
  for delete using (
    church_id = auth_church_id()
    and (sender_id = auth.uid() or auth_role() in ('church_admin', 'pastor', 'super_admin'))
  );

drop policy if exists "messages_super_admin" on messages;
create policy "messages_super_admin" on messages
  for all using (auth_role() = 'super_admin');

-- Índices para performance
create index if not exists idx_chat_rooms_church_id on chat_rooms(church_id);
create index if not exists idx_messages_room_id on messages(room_id);
create index if not exists idx_messages_church_id on messages(church_id);
create index if not exists idx_messages_created_at on messages(created_at asc);
