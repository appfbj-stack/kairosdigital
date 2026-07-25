-- Ministérios
create table ministries (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  name text not null,
  description text,
  leader_id uuid references members(id),
  active boolean not null default true,
  color text not null default '#6366f1',
  icon text not null default 'Star',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);

create index idx_ministries_church on ministries(church_id);

create trigger trg_updated_at before update on ministries
  for each row execute function update_updated_at();

alter table ministries enable row level security;

create policy "ministries_select" on ministries
  for select using (church_id = auth_church_id());

create policy "ministries_insert" on ministries
  for insert with check (church_id = auth_church_id() and auth_role() in ('church_admin','pastor'));

create policy "ministries_update" on ministries
  for update using (church_id = auth_church_id() and auth_role() in ('church_admin','pastor','leader'));

create policy "ministries_delete" on ministries
  for delete using (church_id = auth_church_id() and auth_role() in ('church_admin','pastor'));

-- Membros de ministério
create table ministry_members (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  ministry_id uuid not null references ministries(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null,
  unique(ministry_id, member_id)
);

alter table ministry_members enable row level security;

create policy "ministry_members_select" on ministry_members
  for select using (church_id = auth_church_id());

create policy "ministry_members_insert" on ministry_members
  for insert with check (church_id = auth_church_id() and auth_role() in ('church_admin','pastor','leader'));
