-- Row Level Security para isolamento multi-tenant

-- Enable RLS
alter table churches enable row level security;
alter table users enable row level security;
alter table members enable row level security;
alter table cells enable row level security;
alter table events enable row level security;
alter table transactions enable row level security;
alter table prayer_requests enable row level security;
alter table sermons enable row level security;
alter table chat_rooms enable row level security;
alter table messages enable row level security;

-- Helper: retorna o church_id do usuário autenticado
create or replace function auth_church_id()
returns uuid as $$
  select church_id from users where id = auth.uid()
$$ language sql security definer stable;

-- Helper: retorna o role do usuário autenticado
create or replace function auth_role()
returns user_role as $$
  select role from users where id = auth.uid()
$$ language sql security definer stable;

-- Churches: usuário vê apenas sua própria igreja
create policy "users_see_own_church" on churches
  for select using (id = auth_church_id());

create policy "church_admin_update_church" on churches
  for update using (id = auth_church_id() and auth_role() in ('church_admin', 'super_admin'));

-- Users: vê apenas usuários da mesma igreja
create policy "users_see_church_users" on users
  for select using (church_id = auth_church_id());

create policy "users_update_own_profile" on users
  for update using (id = auth.uid());

-- Members: vê apenas membros da sua igreja
create policy "members_select" on members
  for select using (church_id = auth_church_id());

create policy "members_insert" on members
  for insert with check (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'leader'));

create policy "members_update" on members
  for update using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'leader'));

create policy "members_delete" on members
  for delete using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor'));

-- Cells
create policy "cells_select" on cells
  for select using (church_id = auth_church_id());

create policy "cells_insert" on cells
  for insert with check (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor'));

create policy "cells_update" on cells
  for update using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'leader'));

-- Events
create policy "events_select" on events
  for select using (church_id = auth_church_id());

create policy "events_insert" on events
  for insert with check (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'leader'));

create policy "events_update" on events
  for update using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'leader'));

-- Transactions
create policy "transactions_select" on transactions
  for select using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor'));

create policy "transactions_insert" on transactions
  for insert with check (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor'));

-- Prayer requests
create policy "prayer_select" on prayer_requests
  for select using (
    church_id = auth_church_id() and (
      not is_anonymous or auth_role() in ('church_admin', 'pastor', 'leader')
    )
  );

create policy "prayer_insert" on prayer_requests
  for insert with check (church_id = auth_church_id());

-- Sermons
create policy "sermons_select" on sermons
  for select using (church_id = auth_church_id());

create policy "sermons_insert" on sermons
  for insert with check (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor'));

-- Chat rooms
create policy "chat_rooms_select" on chat_rooms
  for select using (church_id = auth_church_id());

-- Messages
create policy "messages_select" on messages
  for select using (church_id = auth_church_id());

create policy "messages_insert" on messages
  for insert with check (church_id = auth_church_id() and sender_id = auth.uid());
