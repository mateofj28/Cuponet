-- =============================================================
-- Cuponet · 0004 · Gestión de administradores
-- Función para promover/degradar admins de forma controlada, en lugar
-- de editar la columna `role` a mano (que el trigger de protección
-- bloquea, por diseño).
--
-- Regla: solo un admin existente puede cambiar roles. El PRIMER admin
-- se promueve una única vez con `bootstrap_first_admin` (ver nota).
-- =============================================================

-- Cambia el rol de un usuario. Solo ejecutable por un admin.
-- security definer: corre como owner, por lo que puede actualizar `role`
-- (el trigger permite el cambio cuando is_admin() es true; además el owner
-- no es frenado por RLS).
create or replace function public.set_user_role(p_user uuid, p_role public.user_role)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede cambiar roles.';
  end if;
  update public.profiles set role = p_role where id = p_user;
  if not found then
    raise exception 'Usuario no encontrado.';
  end if;
end;
$$;

grant execute on function public.set_user_role(uuid, public.user_role) to authenticated;

-- -------------------------------------------------------------
-- Bootstrap del PRIMER admin.
-- Como todavía no existe ningún admin, set_user_role no sirve para el
-- primero. Esta función solo funciona si NO hay ningún admin aún, para
-- evitar que se use como puerta trasera una vez que el sistema está en
-- marcha. Promueve al usuario con el email indicado.
-- Se ejecuta desde el SQL Editor una única vez.
-- -------------------------------------------------------------
create or replace function public.bootstrap_first_admin(p_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid;
begin
  if exists (select 1 from public.profiles where role = 'admin') then
    raise exception 'Ya existe al menos un admin. Usá set_user_role().';
  end if;

  select id into v_user from auth.users where email = lower(p_email);
  if v_user is null then
    raise exception 'No hay un usuario con ese email.';
  end if;

  -- Desactiva el trigger de protección solo dentro de esta transacción
  -- controlada para poder setear el primer admin.
  alter table public.profiles disable trigger trg_protect_profile_cols;
  update public.profiles set role = 'admin' where id = v_user;
  alter table public.profiles enable trigger trg_protect_profile_cols;
end;
$$;
