-- Tabelas de chat novas — sem conflito com tabelas existentes

create table if not exists k_rooms (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  name text not null,
  type text not null default 'general',
  created_at timestamptz not null default now(),
  created_by uuid not null references users(id) on delete cascade
);

create index if not exists idx_k_rooms_church on k_rooms(church_id);

alter table k_rooms enable row level security;

create policy "k_rooms_select" on k_rooms
  for select using (church_id = auth_church_id());

create policy "k_rooms_insert" on k_rooms
  for insert with check (church_id = auth_church_id());

create policy "k_rooms_update" on k_rooms
  for update using (church_id = auth_church_id() and auth_role() in ('church_admin','pastor','leader','super_admin'));

create policy "k_rooms_delete" on k_rooms
  for delete using (church_id = auth_church_id() and auth_role() in ('church_admin','pastor','super_admin'));

-- Mensagens
create table if not exists k_messages (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  room_id uuid not null references k_rooms(id) on delete cascade,
  sender_id uuid not null references users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_k_messages_room on k_messages(room_id, created_at asc);
create index if not exists idx_k_messages_church on k_messages(church_id);

alter table k_messages enable row level security;

create policy "k_messages_select" on k_messages
  for select using (church_id = auth_church_id());

create policy "k_messages_insert" on k_messages
  for insert with check (church_id = auth_church_id() and sender_id = auth.uid());

create policy "k_messages_delete" on k_messages
  for delete using (church_id = auth_church_id() and (sender_id = auth.uid() or auth_role() in ('church_admin','pastor','super_admin')));
