-- CRÍTICO: Trigger para criar church + user automaticamente no cadastro
-- Sem isso, auth_church_id() retorna null e TODAS as RLS policies falham

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_church_id uuid;
  v_church_name text;
  v_user_name text;
  v_slug text;
begin
  -- Extrai dados do metadata do signup
  v_church_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'church_name'), ''),
    'Minha Igreja'
  );
  v_user_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    split_part(new.email, '@', 1)
  );

  -- Gera slug único para a igreja
  v_slug := lower(regexp_replace(
    unaccent(v_church_name), '[^a-z0-9]+', '-', 'g'
  )) || '-' || substring(gen_random_uuid()::text, 1, 6);

  -- Cria a igreja
  insert into public.churches (name, slug, plan, created_by)
  values (v_church_name, v_slug, 'free', new.id)
  returning id into v_church_id;

  -- Cria o usuário como church_admin da sua própria igreja
  insert into public.users (id, church_id, name, role)
  values (new.id, v_church_id, v_user_name, 'church_admin');

  return new;
exception when others then
  -- Loga o erro mas não bloqueia o cadastro
  raise warning 'handle_new_user error: %', sqlerrm;
  return new;
end;
$$;

-- Garante que a extensão unaccent exista (remove acentos do slug)
create extension if not exists unaccent;

-- Remove trigger anterior se existir
drop trigger if exists on_auth_user_created on auth.users;

-- Cria o trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
