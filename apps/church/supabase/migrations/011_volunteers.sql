-- Tabela de voluntários
create table if not exists volunteers (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  member_id uuid not null references members(id) on delete cascade,
  role text not null,                          -- função: "Líder de Louvor", "Som", "Recepção"...
  ministry_id uuid references ministries(id) on delete set null,
  availability text[] not null default '{}',   -- ["domingo_manha","domingo_noite","quarta"]
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null,
  unique(church_id, member_id, role)           -- evita duplicata de função por membro
);

create index if not exists idx_volunteers_church_id on volunteers(church_id);
create index if not exists idx_volunteers_member_id on volunteers(member_id);
create index if not exists idx_volunteers_ministry_id on volunteers(ministry_id);

alter table volunteers enable row level security;

create policy "volunteers_select" on volunteers
  for select using (church_id = auth_church_id());

create policy "volunteers_insert" on volunteers
  for insert with check (church_id = auth_church_id() and auth_role() in ('church_admin','pastor','leader','super_admin'));

create policy "volunteers_update" on volunteers
  for update using (church_id = auth_church_id() and auth_role() in ('church_admin','pastor','leader','super_admin'));

create policy "volunteers_delete" on volunteers
  for delete using (church_id = auth_church_id() and auth_role() in ('church_admin','pastor','super_admin'));

create policy "volunteers_super_admin" on volunteers
  for all using (auth_role() = 'super_admin');

-- Tabela de escala (agenda de voluntários por evento/data)
create table if not exists volunteer_schedules (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  volunteer_id uuid not null references volunteers(id) on delete cascade,
  event_id uuid references events(id) on delete set null,
  date date not null,
  period text not null default 'manha',        -- manha | tarde | noite
  confirmed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);

create index if not exists idx_volunteer_schedules_church_id on volunteer_schedules(church_id);
create index if not exists idx_volunteer_schedules_volunteer_id on volunteer_schedules(volunteer_id);
create index if not exists idx_volunteer_schedules_date on volunteer_schedules(date);

alter table volunteer_schedules enable row level security;

create policy "volunteer_schedules_select" on volunteer_schedules
  for select using (church_id = auth_church_id());

create policy "volunteer_schedules_insert" on volunteer_schedules
  for insert with check (church_id = auth_church_id() and auth_role() in ('church_admin','pastor','leader','super_admin'));

create policy "volunteer_schedules_update" on volunteer_schedules
  for update using (church_id = auth_church_id() and auth_role() in ('church_admin','pastor','leader','super_admin'));

create policy "volunteer_schedules_delete" on volunteer_schedules
  for delete using (church_id = auth_church_id() and auth_role() in ('church_admin','pastor','super_admin'));

create policy "volunteer_schedules_super_admin" on volunteer_schedules
  for all using (auth_role() = 'super_admin');
