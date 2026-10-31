-- =============================================================
-- Cuponet · 0007 · Funciones de métricas para el panel admin
-- Agregaciones calculadas en la base (datos reales, no ficticios).
-- Todas validan is_admin() y devuelven JSON. security definer para
-- poder agregar sobre todas las filas sin exponer datos crudos.
-- =============================================================

-- ---------- Métricas del dashboard ----------
create or replace function public.admin_dashboard_metrics()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result json;
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede ver estas métricas.';
  end if;

  select json_build_object(
    'total_usuarios',
      (select count(*) from public.profiles),
    'nuevos_hoy',
      (select count(*) from public.profiles
        where created_at >= date_trunc('day', now())),
    'membresias_activas',
      (select count(distinct user_id) from public.memberships
        where expiracion > now()),
    'cupones_canjeados_hoy',
      (select count(*) from public.canjes
        where fecha >= date_trunc('day', now())),
    'sorteos_activos',
      (select count(*) from public.sorteos where estado = 'activo'),
    'sorteos_finalizados',
      (select count(*) from public.sorteos where estado = 'cerrado'),
    'puntos_cargados_hoy',
      (select coalesce(sum(creditos), 0) from public.movimientos
        where tipo = 'carga_creditos'
          and fecha >= date_trunc('day', now()))
  ) into v_result;

  return v_result;
end;
$$;

-- ---------- Serie de puntos cargados por día (últimos 7 días) ----------
create or replace function public.admin_puntos_cargados_semana()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result json;
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede ver estas métricas.';
  end if;

  select json_agg(fila order by fila.dia) into v_result
  from (
    select
      d.dia::date as dia,
      coalesce(sum(m.creditos), 0) as total
    from generate_series(
      date_trunc('day', now()) - interval '6 days',
      date_trunc('day', now()),
      interval '1 day'
    ) as d(dia)
    left join public.movimientos m
      on m.tipo = 'carga_creditos'
      and date_trunc('day', m.fecha) = d.dia
    group by d.dia
  ) fila;

  return coalesce(v_result, '[]'::json);
end;
$$;

-- ---------- Estadísticas de sorteos (con filtros opcionales) ----------
-- p_desde / p_hasta: rango por fecha de creación del sorteo (nullables).
-- p_estado: 'activo' | 'cerrado' | null (todos).
create or replace function public.admin_sorteo_stats(
  p_desde timestamptz default null,
  p_hasta timestamptz default null,
  p_estado text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result json;
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede ver estas métricas.';
  end if;

  with sorteos_filtrados as (
    select * from public.sorteos s
    where (p_desde is null or s.created_at >= p_desde)
      and (p_hasta is null or s.created_at <= p_hasta)
      and (p_estado is null or s.estado = p_estado::sorteo_estado)
  ),
  insc as (
    select * from public.inscripciones i
    where i.sorteo_id in (select id from sorteos_filtrados)
  )
  select json_build_object(
    'sorteos_total',       (select count(*) from sorteos_filtrados),
    'sorteos_activos',     (select count(*) from sorteos_filtrados where estado = 'activo'),
    'sorteos_finalizados', (select count(*) from sorteos_filtrados where estado = 'cerrado'),
    'participaciones',     (select coalesce(sum(cardinality(numeros)), 0) from insc),
    'usuarios_participantes', (select count(distinct user_id) from insc),
    'puntos_utilizados',
      (select coalesce(-sum(creditos), 0) from public.movimientos
        where tipo = 'inscripcion_sorteo'
          and (p_desde is null or fecha >= p_desde)
          and (p_hasta is null or fecha <= p_hasta))
  ) into v_result;

  return v_result;
end;
$$;

-- ---------- Permisos ----------
grant execute on function public.admin_dashboard_metrics() to authenticated;
grant execute on function public.admin_puntos_cargados_semana() to authenticated;
grant execute on function public.admin_sorteo_stats(timestamptz, timestamptz, text) to authenticated;
