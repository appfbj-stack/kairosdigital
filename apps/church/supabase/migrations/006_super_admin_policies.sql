-- Super Admin: acesso irrestrito a todas as tabelas
-- super_admin pode ler qualquer church_id (para o painel de admin)

-- churches
create policy "super_admin_churches_all" on churches
  for all using (auth_role() = 'super_admin');

-- users
create policy "super_admin_users_all" on users
  for all using (auth_role() = 'super_admin');

-- members
create policy "super_admin_members_all" on members
  for all using (auth_role() = 'super_admin');

-- cells
create policy "super_admin_cells_all" on cells
  for all using (auth_role() = 'super_admin');

-- events
create policy "super_admin_events_all" on events
  for all using (auth_role() = 'super_admin');

-- transactions
create policy "super_admin_transactions_all" on transactions
  for all using (auth_role() = 'super_admin');

-- prayer_requests
create policy "super_admin_prayer_all" on prayer_requests
  for all using (auth_role() = 'super_admin');

-- sermons
create policy "super_admin_sermons_all" on sermons
  for all using (auth_role() = 'super_admin');

-- chat_rooms
create policy "super_admin_rooms_all" on chat_rooms
  for all using (auth_role() = 'super_admin');

-- messages
create policy "super_admin_messages_all" on messages
  for all using (auth_role() = 'super_admin');

-- ministries
create policy "super_admin_ministries_all" on ministries
  for all using (auth_role() = 'super_admin');
