-- Migration de catchup: cria tabelas faltantes com IF NOT EXISTS
-- Seguro de rodar mesmo que algumas já existam

-- Extensões (idempotente)
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "unaccent";

-- Enums (apenas se não existirem)
do $$ begin
  create type user_role as enum ('super_admin', 'church_admin', 'pastor', 'leader', 'member', 'visitor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type member_status as enum ('active', 'inactive', 'visitor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type transaction_type as enum ('income', 'expense');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('pix', 'cash', 'transfer', 'card');
exception when duplicate_object then null; end $$;

do $$ begin
  create type plan_type as enum ('free', 'starter', 'pro', 'enterprise');
exception when duplicate_object then null; end $$;

-- Churches
create table if not exists churches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan plan_type not null default 'free',
  active_modules text[] not null default '{}',
  branding jsonb not null default '{}',
  custom_domain text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);

-- Users (public profile)
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  church_id uuid not null references churches(id) on delete cascade,
  email text not null,
  name text not null,
  avatar_url text,
  role user_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);

-- Cells (precisa existir antes de members por FK)
create table if not exists cells (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  name text not null,
  leader_id uuid,  -- FK adicionada depois para evitar dependência circular
  meeting_day text not null,
  meeting_time text not null,
  address text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);

-- Members
create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text,
  phone text,
  avatar_url text,
  birthdate date,
  baptism_date date,
  status member_status not null default 'active',
  cell_id uuid references cells(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);

-- Adiciona cell_id em members se já existir a tabela sem a coluna
alter table members add column if not exists cell_id uuid references cells(id) on delete set null;

-- Adiciona FK de cells.leader_id → members
do $$ begin
  alter table cells add column leader_id uuid references members(id) on delete set null;
exception when duplicate_column then null; end $$;

-- Events
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz,
  location text,
  type text not null default 'event',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);

-- Transactions
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  type transaction_type not null,
  category text not null,
  amount numeric(12,2) not null,
  description text,
  date date not null,
  member_id uuid references members(id) on delete set null,
  payment_method payment_method not null default 'pix',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);

-- Prayer requests
create table if not exists prayer_requests (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  member_id uuid references members(id) on delete set null,
  title text not null,
  description text not null,
  status text not null default 'open',
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);

-- Sermons
create table if not exists sermons (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  title text not null,
  pastor_id uuid not null references users(id) on delete cascade,
  series text,
  scripture text,
  video_url text,
  audio_url text,
  pdf_url text,
  preached_at date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);

-- Ministries
create table if not exists ministries (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  name text not null,
  description text,
  leader_id uuid references members(id) on delete set null,
  color text not null default '#7C3AED',
  icon text not null default 'church',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);

-- Ministry members
create table if not exists ministry_members (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  ministry_id uuid not null references ministries(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  role text not null default 'membro',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null,
  unique(ministry_id, member_id)
);

-- Chat rooms
create table if not exists chat_rooms (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  name text not null,
  type text not null default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);

-- Messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  room_id uuid not null references chat_rooms(id) on delete cascade,
  sender_id uuid not null references users(id) on delete cascade,
  content text not null,
  type text not null default 'text',
  media_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);

-- Garante que users tem todas as colunas necessárias
alter table users add column if not exists church_id uuid references churches(id) on delete cascade;
alter table users add column if not exists email text;
alter table users add column if not exists name text;
alter table users add column if not exists avatar_url text;
alter table users add column if not exists role user_role not null default 'member';
alter table users add column if not exists created_at timestamptz not null default now();
alter table users add column if not exists updated_at timestamptz not null default now();
alter table users add column if not exists created_by uuid;

-- Garante que messages tem todas as colunas necessárias
alter table messages add column if not exists church_id uuid references churches(id) on delete cascade;
alter table messages add column if not exists room_id uuid references chat_rooms(id) on delete cascade;
alter table messages add column if not exists sender_id uuid references users(id) on delete cascade;
alter table messages add column if not exists content text;
alter table messages add column if not exists type text not null default 'text';
alter table messages add column if not exists media_url text;
alter table messages add column if not exists created_at timestamptz not null default now();
alter table messages add column if not exists updated_at timestamptz not null default now();
alter table messages add column if not exists created_by uuid;

-- Garante que chat_rooms tem church_id
alter table chat_rooms add column if not exists church_id uuid references churches(id) on delete cascade;

-- Garante que members tem todas as colunas necessárias
alter table members add column if not exists church_id uuid references churches(id) on delete cascade;
alter table members add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table members add column if not exists name text;
alter table members add column if not exists email text;
alter table members add column if not exists phone text;
alter table members add column if not exists avatar_url text;
alter table members add column if not exists birthdate date;
alter table members add column if not exists baptism_date date;
alter table members add column if not exists status member_status not null default 'active';
alter table members add column if not exists created_at timestamptz not null default now();
alter table members add column if not exists updated_at timestamptz not null default now();
alter table members add column if not exists created_by uuid;

-- Índices (defensivo — ignora se coluna não existir)
do $$
begin
  create index if not exists idx_users_church_id on users(church_id);
exception when undefined_column then null; end $$;
do $$
begin
  create index if not exists idx_members_church_id on members(church_id);
exception when undefined_column then null; end $$;
do $$
begin
  create index if not exists idx_members_cell_id on members(cell_id);
exception when undefined_column then null; end $$;
do $$
begin
  create index if not exists idx_cells_church_id on cells(church_id);
exception when undefined_column then null; end $$;
do $$
begin
  create index if not exists idx_events_church_id on events(church_id);
exception when undefined_column then null; end $$;
do $$
begin
  create index if not exists idx_transactions_church_id on transactions(church_id);
exception when undefined_column then null; end $$;
do $$
begin
  create index if not exists idx_prayer_requests_church_id on prayer_requests(church_id);
exception when undefined_column then null; end $$;
do $$
begin
  create index if not exists idx_sermons_church_id on sermons(church_id);
exception when undefined_column then null; end $$;
do $$
begin
  create index if not exists idx_ministries_church_id on ministries(church_id);
exception when undefined_column then null; end $$;
do $$
begin
  create index if not exists idx_ministry_members_ministry_id on ministry_members(ministry_id);
exception when undefined_column then null; end $$;
do $$
begin
  create index if not exists idx_messages_room_id on messages(room_id);
exception when undefined_column then null; end $$;

-- Habilita RLS em todas as tabelas
do $$
declare t text;
begin
  foreach t in array array['churches','users','members','cells','events','transactions',
    'prayer_requests','sermons','chat_rooms','messages','ministries','ministry_members']
  loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

-- Funções auxiliares de RLS
create or replace function auth_church_id() returns uuid
language sql stable security definer
as $$ select church_id from public.users where id = auth.uid() $$;

create or replace function auth_role() returns text
language sql stable security definer
as $$ select role::text from public.users where id = auth.uid() $$;

-- ─── RLS Policies ────────────────────────────────────────────────────────────

-- Macro para criar policies com IF NOT EXISTS (via drop + create)
-- Churches
drop policy if exists "churches_select" on churches;
create policy "churches_select" on churches for select using (id = auth_church_id() or auth_role() = 'super_admin');
drop policy if exists "churches_update" on churches;
create policy "churches_update" on churches for update using (id = auth_church_id() and auth_role() in ('church_admin') or auth_role() = 'super_admin');

-- Users
drop policy if exists "users_select" on users;
create policy "users_select" on users for select using (church_id = auth_church_id() or auth_role() = 'super_admin');
drop policy if exists "users_insert" on users;
create policy "users_insert" on users for insert with check (id = auth.uid());
drop policy if exists "users_update" on users;
create policy "users_update" on users for update using (id = auth.uid() or auth_role() in ('church_admin', 'super_admin'));

-- Members
drop policy if exists "members_select" on members;
create policy "members_select" on members for select using (church_id = auth_church_id());
drop policy if exists "members_insert" on members;
create policy "members_insert" on members for insert with check (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'leader', 'super_admin'));
drop policy if exists "members_update" on members;
create policy "members_update" on members for update using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'leader', 'super_admin'));
drop policy if exists "members_delete" on members;
create policy "members_delete" on members for delete using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'super_admin'));

-- Cells
drop policy if exists "cells_select" on cells;
create policy "cells_select" on cells for select using (church_id = auth_church_id());
drop policy if exists "cells_insert" on cells;
create policy "cells_insert" on cells for insert with check (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'super_admin'));
drop policy if exists "cells_update" on cells;
create policy "cells_update" on cells for update using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'super_admin'));
drop policy if exists "cells_delete" on cells;
create policy "cells_delete" on cells for delete using (church_id = auth_church_id() and auth_role() in ('church_admin', 'super_admin'));

-- Events
drop policy if exists "events_select" on events;
create policy "events_select" on events for select using (church_id = auth_church_id());
drop policy if exists "events_insert" on events;
create policy "events_insert" on events for insert with check (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'leader', 'super_admin'));
drop policy if exists "events_update" on events;
create policy "events_update" on events for update using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'leader', 'super_admin'));
drop policy if exists "events_delete" on events;
create policy "events_delete" on events for delete using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'super_admin'));

-- Transactions
drop policy if exists "transactions_select" on transactions;
create policy "transactions_select" on transactions for select using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'super_admin'));
drop policy if exists "transactions_insert" on transactions;
create policy "transactions_insert" on transactions for insert with check (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'super_admin'));
drop policy if exists "transactions_update" on transactions;
create policy "transactions_update" on transactions for update using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'super_admin'));
drop policy if exists "transactions_delete" on transactions;
create policy "transactions_delete" on transactions for delete using (church_id = auth_church_id() and auth_role() in ('church_admin', 'super_admin'));

-- Prayer requests
drop policy if exists "prayer_select" on prayer_requests;
create policy "prayer_select" on prayer_requests for select using (church_id = auth_church_id());
drop policy if exists "prayer_insert" on prayer_requests;
create policy "prayer_insert" on prayer_requests for insert with check (church_id = auth_church_id());
drop policy if exists "prayer_update" on prayer_requests;
create policy "prayer_update" on prayer_requests for update using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'leader', 'super_admin'));
drop policy if exists "prayer_delete" on prayer_requests;
create policy "prayer_delete" on prayer_requests for delete using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'super_admin'));

-- Sermons
drop policy if exists "sermons_select" on sermons;
create policy "sermons_select" on sermons for select using (church_id = auth_church_id());
drop policy if exists "sermons_insert" on sermons;
create policy "sermons_insert" on sermons for insert with check (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'super_admin'));
drop policy if exists "sermons_update" on sermons;
create policy "sermons_update" on sermons for update using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'super_admin'));
drop policy if exists "sermons_delete" on sermons;
create policy "sermons_delete" on sermons for delete using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'super_admin'));

-- Ministries
drop policy if exists "ministries_select" on ministries;
create policy "ministries_select" on ministries for select using (church_id = auth_church_id());
drop policy if exists "ministries_insert" on ministries;
create policy "ministries_insert" on ministries for insert with check (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'super_admin'));
drop policy if exists "ministries_update" on ministries;
create policy "ministries_update" on ministries for update using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'super_admin'));
drop policy if exists "ministries_delete" on ministries;
create policy "ministries_delete" on ministries for delete using (church_id = auth_church_id() and auth_role() in ('church_admin', 'super_admin'));

-- Ministry members
drop policy if exists "ministry_members_select" on ministry_members;
create policy "ministry_members_select" on ministry_members for select using (church_id = auth_church_id());
drop policy if exists "ministry_members_insert" on ministry_members;
create policy "ministry_members_insert" on ministry_members for insert with check (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'leader', 'super_admin'));
drop policy if exists "ministry_members_update" on ministry_members;
create policy "ministry_members_update" on ministry_members for update using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'leader', 'super_admin'));
drop policy if exists "ministry_members_delete" on ministry_members;
create policy "ministry_members_delete" on ministry_members for delete using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'leader', 'super_admin'));

-- Chat rooms
drop policy if exists "chat_rooms_select" on chat_rooms;
create policy "chat_rooms_select" on chat_rooms for select using (church_id = auth_church_id());
drop policy if exists "chat_rooms_insert" on chat_rooms;
create policy "chat_rooms_insert" on chat_rooms for insert with check (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'leader', 'super_admin'));
drop policy if exists "chat_rooms_update" on chat_rooms;
create policy "chat_rooms_update" on chat_rooms for update using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'super_admin'));
drop policy if exists "chat_rooms_delete" on chat_rooms;
create policy "chat_rooms_delete" on chat_rooms for delete using (church_id = auth_church_id() and auth_role() in ('church_admin', 'super_admin'));

-- Messages
drop policy if exists "messages_select" on messages;
create policy "messages_select" on messages for select using (church_id = auth_church_id());
drop policy if exists "messages_insert" on messages;
create policy "messages_insert" on messages for insert with check (church_id = auth_church_id());
drop policy if exists "messages_delete" on messages;
create policy "messages_delete" on messages for delete using (church_id = auth_church_id() and (sender_id = auth.uid() or auth_role() in ('church_admin', 'pastor', 'super_admin')));

-- Super admin — acesso total a tudo
do $$
declare t text;
begin
  foreach t in array array['churches','users','members','cells','events','transactions',
    'prayer_requests','sermons','chat_rooms','messages','ministries','ministry_members']
  loop
    execute format('drop policy if exists "%s_super_admin" on %I', t, t);
    execute format('create policy "%s_super_admin" on %I for all using (auth_role() = ''super_admin'')', t, t);
  end loop;
end $$;

-- ─── Trigger de registro (cria church + user automaticamente) ────────────────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_church_id uuid;
  v_church_name text;
  v_user_name text;
  v_slug text;
begin
  v_church_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'church_name'), ''),
    'Minha Igreja'
  );
  v_user_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    split_part(new.email, '@', 1)
  );
  v_slug := lower(regexp_replace(
    unaccent(v_church_name), '[^a-z0-9]+', '-', 'g'
  )) || '-' || substring(gen_random_uuid()::text, 1, 6);

  insert into public.churches (name, slug, plan, created_by)
  values (v_church_name, v_slug, 'free', new.id)
  returning id into v_church_id;

  insert into public.users (id, church_id, email, name, role, created_by)
  values (new.id, v_church_id, coalesce(new.email, ''), v_user_name, 'church_admin', new.id);

  return new;
exception when others then
  raise warning 'handle_new_user error: % — %', sqlstate, sqlerrm;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Storage bucket para avatares
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do nothing;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists "avatars_auth_upload" on storage.objects;
create policy "avatars_auth_upload" on storage.objects for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
drop policy if exists "avatars_auth_update" on storage.objects;
create policy "avatars_auth_update" on storage.objects for update using (bucket_id = 'avatars' and auth.role() = 'authenticated');
