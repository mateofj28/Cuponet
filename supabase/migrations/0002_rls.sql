-- =============================================================
-- Cuponet · 0002 · Row Level Security
-- RLS en todas las tablas + helper is_admin() + políticas.
-- Regla: el frontend no es confiable; la seguridad vive acá.
-- =============================================================

-- ---------- Helper: ¿el usuario actual es admin? ----------
-- security definer + search_path fijo para evitar escaladas.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

comment on function public.is_admin() is 'True si el usuario autenticado tiene rol admin (leído desde la base).';

-- ---------- Habilitar RLS ----------
alter table public.profiles       enable row level security;
alter table public.planes         enable row level security;
alter table public.memberships    enable row level security;
alter table public.comercios      enable row level security;
alter table public.cupones        enable row level security;
alter table public.canjes         enable row level security;
alter table public.sorteos        enable row level security;
alter table public.inscripciones  enable row level security;
alter table public.movimientos    enable row level security;

-- =============================================================
-- profiles
-- =============================================================
-- Cada usuario lee su perfil; el admin lee todos.
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- El usuario puede actualizar su perfil (p. ej. nombre), pero NO su
-- rol ni sus créditos: eso se protege con un trigger (abajo).
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Evita que un usuario cambie su propio role/creditos por update directo.
-- Los cambios legítimos vienen de funciones security definer (que corren
-- como owner y saltan este trigger cuando auth.uid() difiere o vía set local).
create or replace function public.protect_profile_sensitive_cols()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_admin() then
    return new;  -- el admin puede ajustar vía panel si hiciera falta
  end if;
  if new.role is distinct from old.role then
    raise exception 'No podés modificar tu rol.';
  end if;
  if new.creditos is distinct from old.creditos then
    raise exception 'No podés modificar tus créditos directamente.';
  end if;
  return new;
end;
$$;

create trigger trg_protect_profile_cols
  before update on public.profiles
  for each row execute function public.protect_profile_sensitive_cols();

-- =============================================================
-- Catálogo público (para miembros autenticados): planes, comercios,
-- cupones, sorteos -> lectura para autenticados; escritura solo admin.
-- =============================================================
create policy planes_select_auth on public.planes
  for select to authenticated using (true);
create policy planes_admin_write on public.planes
  for all using (public.is_admin()) with check (public.is_admin());

create policy comercios_select_auth on public.comercios
  for select to authenticated using (true);
create policy comercios_admin_write on public.comercios
  for all using (public.is_admin()) with check (public.is_admin());

create policy cupones_select_auth on public.cupones
  for select to authenticated using (true);
create policy cupones_admin_write on public.cupones
  for all using (public.is_admin()) with check (public.is_admin());

create policy sorteos_select_auth on public.sorteos
  for select to authenticated using (true);
create policy sorteos_admin_write on public.sorteos
  for all using (public.is_admin()) with check (public.is_admin());

-- =============================================================
-- Datos propios del usuario: memberships, canjes, inscripciones,
-- movimientos -> el usuario lee lo suyo; admin lee todo.
-- La ESCRITURA se hace vía funciones security definer (no políticas
-- de insert/update directas para el usuario).
-- =============================================================
create policy memberships_select_own on public.memberships
  for select using (user_id = auth.uid() or public.is_admin());

create policy canjes_select_own on public.canjes
  for select using (user_id = auth.uid() or public.is_admin());

create policy inscripciones_select_own on public.inscripciones
  for select using (user_id = auth.uid() or public.is_admin());

create policy movimientos_select_own on public.movimientos
  for select using (user_id = auth.uid() or public.is_admin());
