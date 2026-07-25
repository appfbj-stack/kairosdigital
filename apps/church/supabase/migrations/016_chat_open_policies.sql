-- Abre permissões do chat para qualquer membro autenticado da mesma igreja
-- Remove restrição de role (church_admin/pastor/leader) para criar salas e mensagens

-- chat_rooms: qualquer membro da mesma igreja pode criar sala
drop policy if exists "chat_rooms_insert" on chat_rooms;
create policy "chat_rooms_insert" on chat_rooms
  for insert with check (church_id = auth_church_id());

-- chat_rooms: todos da igreja veem as salas
drop policy if exists "chat_rooms_select" on chat_rooms;
create policy "chat_rooms_select" on chat_rooms
  for select using (church_id = auth_church_id());

-- messages: qualquer membro da mesma igreja pode enviar mensagem
drop policy if exists "messages_insert" on messages;
create policy "messages_insert" on messages
  for insert with check (church_id = auth_church_id());

-- messages: todos da igreja veem as mensagens
drop policy if exists "messages_select" on messages;
create policy "messages_select" on messages
  for select using (church_id = auth_church_id());

-- Garante que RLS está habilitado
alter table chat_rooms enable row level security;
alter table messages enable row level security;
