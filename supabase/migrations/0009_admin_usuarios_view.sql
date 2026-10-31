-- =============================================================
-- Cuponet · 0009 · Vista de usuarios para el panel admin
-- Incluye "puntos utilizados" (total gastado = suma de movimientos
-- negativos del usuario) además del saldo actual.
-- La vista respeta RLS vía una función, por eso se expone como
-- función security definer que valida is_admin().
-- =============================================================

create or replace function public.admin_listar_usuarios()
returns table (
  id uuid,
  nombre text,
  apellido text,
  dni text,
  email text,
  role user_role,
  creditos integer,
  puntos_utilizados integer,
  created_at timestamptz,
  plan_id text,
  membresia_inicio timestamptz,
  membresia_expiracion timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.nombre,
    p.apellido,
    p.dni,
    p.email,
    p.role,
    p.creditos,
    -- Total gastado: suma de los movimientos negativos (en positivo).
    coalesce((
      select -sum(m.creditos) from public.movimientos m
      where m.user_id = p.id and m.creditos < 0
    ), 0)::integer as puntos_utilizados,
    p.created_at,
    m.plan_id,
    m.inicio as membresia_inicio,
    m.expiracion as membresia_expiracion
  from public.profiles p
  -- Membresía vigente/última (la de mayor expiración) por usuario.
  left join lateral (
    select plan_id, inicio, expiracion
    from public.memberships
    where user_id = p.id
    order by expiracion desc
    limit 1
  ) m on true
  where public.is_admin()   -- sin admin, no devuelve filas
  order by p.created_at desc;
$$;

grant execute on function public.admin_listar_usuarios() to authenticated;
