-- Mural da Igreja — posts e reações
create table if not exists mural_posts (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  author_id uuid not null references users(id) on delete cascade,
  title text not null,
  content text not null,
  type text not null default 'aviso',   -- aviso | versiculo | comunicado | celebracao | evento
  image_url text,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null
);

create index if not exists idx_mural_posts_church_id on mural_posts(church_id);
create index if not exists idx_mural_posts_created_at on mural_posts(created_at desc);

alter table mural_posts enable row level security;

create policy "mural_posts_select" on mural_posts
  for select using (church_id = auth_church_id());

create policy "mural_posts_insert" on mural_posts
  for insert with check (church_id = auth_church_id() and auth_role() in ('church_admin','pastor','leader','super_admin'));

create policy "mural_posts_update" on mural_posts
  for update using (church_id = auth_church_id() and (author_id = auth.uid() or auth_role() in ('church_admin','pastor','super_admin')));

create policy "mural_posts_delete" on mural_posts
  for delete using (church_id = auth_church_id() and (author_id = auth.uid() or auth_role() in ('church_admin','pastor','super_admin')));

create policy "mural_posts_super_admin" on mural_posts
  for all using (auth_role() = 'super_admin');

-- Reações aos posts
create table if not exists mural_reactions (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  post_id uuid not null references mural_posts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  type text not null default 'like',    -- like | heart | praying | fire
  created_at timestamptz not null default now(),
  unique(post_id, user_id, type)
);

alter table mural_reactions enable row level security;

create policy "mural_reactions_select" on mural_reactions
  for select using (church_id = auth_church_id());

create policy "mural_reactions_insert" on mural_reactions
  for insert with check (church_id = auth_church_id() and user_id = auth.uid());

create policy "mural_reactions_delete" on mural_reactions
  for delete using (church_id = auth_church_id() and user_id = auth.uid());

create policy "mural_reactions_super_admin" on mural_reactions
  for all using (auth_role() = 'super_admin');
