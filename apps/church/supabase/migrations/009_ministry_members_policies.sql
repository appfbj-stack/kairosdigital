-- Adiciona policies faltantes para ministry_members

-- Delete: church_admin, pastor e leader podem remover membros do ministério
create policy "ministry_members_delete" on ministry_members
  for delete using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'leader'));

-- Update: mesmos roles podem alterar role do membro
create policy "ministry_members_update" on ministry_members
  for update using (church_id = auth_church_id() and auth_role() in ('church_admin', 'pastor', 'leader'));

-- Super admin acesso total
create policy "ministry_members_super_admin" on ministry_members
  for all using (auth_role() = 'super_admin');
