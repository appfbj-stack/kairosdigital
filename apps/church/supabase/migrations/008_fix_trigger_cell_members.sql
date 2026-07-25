-- 1. Corrige o trigger de registro (faltava o email — campo NOT NULL na tabela users)
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
  v_church_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'church_name'), ''),
    'Minha Igreja'
  );
  v_user_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'name'), ''),
    split_part(new.email, '@', 1)
  );
  v_slug := lower(regexp_replace(
    unaccent(v_church_name), '[^a-z0-9]+', '-', 'g'
  )) || '-' || substring(gen_random_uuid()::text, 1, 6);

  insert into public.churches (name, slug, plan, created_by)
  values (v_church_name, v_slug, 'free', new.id)
  returning id into v_church_id;

  -- Agora com email incluído
  insert into public.users (id, church_id, email, name, role, created_by)
  values (new.id, v_church_id, coalesce(new.email, ''), v_user_name, 'church_admin', new.id);

  return new;
exception when others then
  raise warning 'handle_new_user error: % — %', sqlstate, sqlerrm;
  return new;
end;
$$;

-- Recria o trigger (substitui o anterior)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 2. Adiciona cell_id aos membros (nullable — nem todo membro é de uma célula)
alter table members
  add column if not exists cell_id uuid references cells(id) on delete set null;

create index if not exists idx_members_cell_id on members(cell_id);
