-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Enums
create type user_role as enum ('super_admin', 'church_admin', 'pastor', 'leader', 'member', 'visitor');
create type member_status as enum ('active', 'inactive', 'visitor');
create type transaction_type as enum ('income', 'expense');
create type payment_method as enum ('pix', 'cash', 'transfer', 'card');
create type plan_type as enum ('free', 'starter', 'pro', 'enterprise');

-- Churches (tenants)
create table churches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  plan plan_type not null default 'free',
  active_modules text[] not null default array['members', 'prayer'],
  branding jsonb not null default '{}',
  custom_domain text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);

-- Users (profile extension)
create table users (
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

-- Members
create table members (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  user_id uuid references users(id),
  name text not null,
  email text,
  phone text,
  avatar_url text,
  birthdate date,
  baptism_date date,
  status member_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);

-- Cells
create table cells (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  name text not null,
  leader_id uuid not null references members(id),
  meeting_day text not null,
  meeting_time text not null,
  address text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);

-- Events
create table events (
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

-- Transactions (finance)
create table transactions (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  type transaction_type not null,
  category text not null,
  amount numeric(12, 2) not null,
  description text,
  date date not null default current_date,
  member_id uuid references members(id),
  payment_method payment_method not null default 'pix',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);

-- Prayer requests
create table prayer_requests (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  member_id uuid references members(id),
  title text not null,
  description text not null,
  status text not null default 'open',
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);

-- Sermons
create table sermons (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  title text not null,
  pastor_id uuid not null references members(id),
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

-- Chat rooms
create table chat_rooms (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  name text not null,
  type text not null default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);

-- Messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  room_id uuid not null references chat_rooms(id) on delete cascade,
  sender_id uuid not null references users(id),
  content text not null,
  type text not null default 'text',
  media_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);

-- Indexes
create index idx_members_church_id on members(church_id);
create index idx_cells_church_id on cells(church_id);
create index idx_events_church_id on events(church_id);
create index idx_transactions_church_id on transactions(church_id);
create index idx_prayer_requests_church_id on prayer_requests(church_id);
create index idx_sermons_church_id on sermons(church_id);
create index idx_messages_room_id on messages(room_id);
create index idx_messages_church_id on messages(church_id);

-- Updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply trigger to all tables
do $$
declare
  t text;
begin
  foreach t in array array['churches','users','members','cells','events','transactions','prayer_requests','sermons','chat_rooms','messages']
  loop
    execute format('create trigger trg_updated_at before update on %I for each row execute function update_updated_at()', t);
  end loop;
end;
$$;
