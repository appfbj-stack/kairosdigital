-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRATION 019 — Correção DEFINITIVA do perfil/chat
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Funções auxiliares (recriadas com tipo consistente) ──────────────────

create or replace function auth_church_id() returns uuid
  language sql stable security definer set search_path = public
  as $$ select church_id from public.users where id = auth.uid() $$;

create or replace function auth_role() returns text
  language sql stable security definer set search_path = public
  as $$ select role::text from public.users where id = auth.uid() $$;

grant execute on function auth_church_id() to authenticated, anon;
grant execute on function auth_role() to authenticated, anon;

-- ─── 2. RPC para criar/corrigir perfil (atômica, bypassa RLS) ────────────────

create or replace function create_missing_profile(
  p_user_id uuid,
  p_email text,
  p_name text,
  p_church_name text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_church_id uuid;
  v_slug text;
  v_existing_church_id uuid;
begin
  -- Se já tem perfil com church_id, retorna ele
  select church_id into v_existing_church_id from public.users where id = p_user_id;
  if v_existing_church_id is not null then
    return jsonb_build_object('ok', true, 'church_id', v_existing_church_id, 'created', false);
  end if;

  -- Cria a church
  v_slug := lower(regexp_replace(coalesce(p_church_name, 'igreja'), '[^a-z0-9]+', '-', 'gi'))
            || '-' || substring(gen_random_uuid()::text, 1, 6);

  insert into public.churches (name, slug, plan, created_by)
  values (coalesce(p_church_name, 'Minha Igreja'), v_slug, 'free', p_user_id)
  returning id into v_church_id;

  -- Cria ou atualiza perfil (tenant_id = church_id para integração Vercel/Supabase)
  insert into public.users (id, tenant_id, church_id, email, name, role, created_by)
  values (p_user_id, v_church_id, v_church_id, coalesce(p_email, ''), coalesce(p_name, 'Usuário'), 'church_admin', p_user_id)
  on conflict (id) do update set
    tenant_id = excluded.tenant_id,
    church_id = excluded.church_id,
    email = excluded.email,
    name = excluded.name;

  return jsonb_build_object('ok', true, 'church_id', v_church_id, 'created', true);
end;
$$;

grant execute on function create_missing_profile(uuid, text, text, text) to authenticated, anon;

-- ─── 3. Policies de users — REMOVE TODAS as antigas e cria novas SEM circular ─

do $$
declare pol record;
begin
  for pol in select policyname from pg_policies where schemaname='public' and tablename='users'
  loop
    execute format('drop policy if exists %I on public.users', pol.policyname);
  end loop;
end $$;

-- Usuário sempre pode ver/atualizar SEU PRÓPRIO perfil (sem dependência de church_id)
create policy "users_own_profile" on public.users
  for select using (id = auth.uid());

create policy "users_update_own" on public.users
  for update using (id = auth.uid());

create policy "users_insert_own" on public.users
  for insert with check (id = auth.uid());

-- Ver outros membros da mesma church (separado, sem circular)
create policy "users_same_church" on public.users
  for select using (
    church_id is not null
    and church_id in (select church_id from public.users where id = auth.uid())
  );

-- Super admin total
create policy "users_super_admin" on public.users
  for all using (auth_role() = 'super_admin');

-- ─── 4. Policy de churches — usuário pode criar a própria church ─────────────

drop policy if exists "churches_insert" on public.churches;
create policy "churches_insert" on public.churches
  for insert with check (created_by = auth.uid());

drop policy if exists "churches_select_own" on public.churches;
create policy "churches_select_own" on public.churches
  for select using (
    id in (select church_id from public.users where id = auth.uid())
    or created_by = auth.uid()
  );

-- ─── 5. Trigger handle_new_user corrigido (com email!) ───────────────────────

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  perform create_missing_profile(
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(trim(new.raw_user_meta_data->>'name'), ''), split_part(new.email, '@', 1), 'Usuário'),
    coalesce(nullif(trim(new.raw_user_meta_data->>'church_name'), ''), 'Minha Igreja')
  );
  return new;
exception when others then
  raise warning 'handle_new_user error: % %', sqlstate, sqlerrm;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── 6. Backfill — corrige usuários existentes sem church_id ─────────────────

do $$
declare
  u record;
begin
  for u in
    select au.id, au.email, au.raw_user_meta_data
    from auth.users au
    left join public.users pu on pu.id = au.id
    where pu.church_id is null
  loop
    perform create_missing_profile(
      u.id,
      coalesce(u.email, ''),
      coalesce(nullif(trim(u.raw_user_meta_data->>'name'), ''), split_part(u.email, '@', 1), 'Usuário'),
      coalesce(nullif(trim(u.raw_user_meta_data->>'church_name'), ''), 'Minha Igreja')
    );
  end loop;
end $$;
