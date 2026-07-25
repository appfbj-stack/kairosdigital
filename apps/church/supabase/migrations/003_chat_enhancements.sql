-- Room members (quem pode ver cada sala)
create table chat_room_members (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  room_id uuid not null references chat_rooms(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null,
  unique(room_id, user_id)
);

-- Reactions on messages
create table message_reactions (
  id uuid primary key default gen_random_uuid(),
  church_id uuid not null references churches(id) on delete cascade,
  message_id uuid not null references messages(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null,
  unique(message_id, user_id, emoji)
);

-- Indexes
create index idx_chat_room_members_room on chat_room_members(room_id);
create index idx_chat_room_members_user on chat_room_members(user_id);
create index idx_message_reactions_message on message_reactions(message_id);
create index idx_messages_created_at on messages(room_id, created_at desc);

-- Updated_at triggers
create trigger trg_updated_at before update on chat_room_members
  for each row execute function update_updated_at();
create trigger trg_updated_at before update on message_reactions
  for each row execute function update_updated_at();

-- RLS
alter table chat_room_members enable row level security;
alter table message_reactions enable row level security;

create policy "room_members_select" on chat_room_members
  for select using (church_id = auth_church_id());

create policy "room_members_insert" on chat_room_members
  for insert with check (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'leader'));

create policy "reactions_select" on message_reactions
  for select using (church_id = auth_church_id());

create policy "reactions_insert" on message_reactions
  for insert with check (church_id = auth_church_id() and user_id = auth.uid());

create policy "reactions_delete" on message_reactions
  for delete using (user_id = auth.uid());

-- Enable realtime for messages
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table message_reactions;
