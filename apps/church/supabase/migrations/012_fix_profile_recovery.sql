-- Função que cria church + user profile para um usuário sem perfil
-- SECURITY DEFINER = roda com permissão do dono da função (bypassa RLS)
create or replace function create_missing_profile(
  p_user_id uuid,
  p_email text,
  p_name text,
  p_church_name text default 'Minha Igreja'
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_church_id uuid;
  v_slug text;
  v_existing_church_id uuid;
begin
  -- Verifica se já tem perfil com church_id
  select church_id into v_existing_church_id
  from public.users
  where id = p_user_id;

  if v_existing_church_id is not null then
    return jsonb_build_object('status', 'already_exists', 'church_id', v_existing_church_id);
  end if;

  -- Gera slug único
  v_slug := lower(regexp_replace(
    unaccent(coalesce(nullif(trim(p_church_name), ''), 'Minha Igreja')),
    '[^a-z0-9]+', '-', 'g'
  )) || '-' || substring(gen_random_uuid()::text, 1, 6);

  -- Cria a igreja
  insert into public.churches (name, slug, plan, created_by)
  values (
    coalesce(nullif(trim(p_church_name), ''), 'Minha Igreja'),
    v_slug,
    'free',
    p_user_id
  )
  returning id into v_church_id;

  -- Cria ou atualiza o perfil do usuário
  insert into public.users (id, church_id, email, name, role, created_by)
  values (p_user_id, v_church_id, coalesce(p_email, ''), coalesce(p_name, 'Admin'), 'church_admin', p_user_id)
  on conflict (id) do update
    set church_id = v_church_id,
        name = coalesce(excluded.name, users.name),
        updated_at = now();

  return jsonb_build_object(
    'status', 'created',
    'church_id', v_church_id,
    'church_name', coalesce(nullif(trim(p_church_name), ''), 'Minha Igreja')
  );
exception when others then
  return jsonb_build_object('status', 'error', 'message', sqlerrm);
end;
$$;

-- Permite qualquer usuário autenticado chamar essa função
grant execute on function create_missing_profile(uuid, text, text, text) to authenticated;

-- Política de INSERT em churches para usuários autenticados (necessário para o trigger e recuperação)
drop policy if exists "churches_insert" on churches;
create policy "churches_insert" on churches
  for insert with check (created_by = auth.uid() or auth_role() = 'super_admin');
