-- Fix definitivo: remove dependência circular nas policies do users
-- O usuário precisa ver sua própria linha SEMPRE (mesmo sem church_id)

-- Users: permite ver própria linha + linhas da mesma church
drop policy if exists "users_select" on users;
create policy "users_select" on users
  for select using (
    id = auth.uid()
    or church_id = auth_church_id()
    or auth_role() = 'super_admin'
  );

-- Users: permite atualizar própria linha
drop policy if exists "users_update" on users;
create policy "users_update" on users
  for update using (
    id = auth.uid()
    or auth_role() in ('church_admin', 'super_admin')
  );

-- Users: permite inserir novo perfil próprio
drop policy if exists "users_insert" on users;
create policy "users_insert" on users
  for insert with check (id = auth.uid());

-- Churches: permite criar a primeira church (para fix do perfil)
drop policy if exists "churches_insert" on churches;
create policy "churches_insert" on churches
  for insert with check (created_by = auth.uid());

-- Churches: select própria church ou admin
drop policy if exists "churches_select" on churches;
create policy "churches_select" on churches
  for select using (
    id = auth_church_id()
    or created_by = auth.uid()
    or auth_role() = 'super_admin'
  );
