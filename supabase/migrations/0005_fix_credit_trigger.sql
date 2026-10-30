-- =============================================================
-- Cuponet · 0005 · Fix del trigger de protección de créditos/rol
--
-- Problema: el trigger protect_profile_sensitive_cols bloqueaba también
-- los updates legítimos hechos por las RPCs security definer (comprar
-- membresía, inscribir sorteo), porque evaluaba is_admin() sobre el
-- cliente que originó la llamada.
--
-- Solución estándar: las RPCs marcan la operación con una variable de
-- sesión `app.allow_credit_change`. El trigger respeta esa marca. Un
-- update directo del usuario (sin la marca) sigue bloqueado.
-- =============================================================

-- ---------- Trigger que respeta la marca de sesión ----------
create or replace function public.protect_profile_sensitive_cols()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_allow text;
begin
  -- Marca seteada por las RPCs legítimas dentro de su transacción.
  v_allow := current_setting('app.allow_credit_change', true);

  if v_allow = 'on' or public.is_admin() then
    return new;
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

-- ---------- RPCs que mueven créditos: setean la marca ----------
-- La marca se setea con set_config(..., true) => local a la transacción,
-- por lo que no "se filtra" a otras operaciones.

create or replace function public.comprar_membresia(p_plan_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user  uuid := auth.uid();
  v_plan  public.planes%rowtype;
  v_saldo integer;
begin
  if v_user is null then
    raise exception 'No autenticado.';
  end if;

  select * into v_plan from public.planes where id = p_plan_id;
  if not found then
    raise exception 'Plan inválido.';
  end if;

  select creditos into v_saldo from public.profiles where id = v_user for update;
  if v_saldo < v_plan.costo_creditos then
    raise exception 'Créditos insuficientes. Te faltan % créditos.',
      v_plan.costo_creditos - v_saldo;
  end if;

  perform set_config('app.allow_credit_change', 'on', true);

  update public.profiles
    set creditos = creditos - v_plan.costo_creditos
    where id = v_user;

  insert into public.memberships (user_id, plan_id, inicio, expiracion)
  values (v_user, v_plan.id, now(), now() + make_interval(months => v_plan.meses));

  insert into public.movimientos (user_id, tipo, detalle, creditos)
  values (
    v_user, 'compra_membresia',
    'Compra de ' || v_plan.nombre || ' (' || v_plan.meses || ' mes/es)',
    -v_plan.costo_creditos
  );
end;
$$;

create or replace function public.inscribir_sorteo(p_sorteo_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user      uuid := auth.uid();
  v_sorteo    public.sorteos%rowtype;
  v_saldo     integer;
  v_asignados integer;
  v_numero    integer;
begin
  if v_user is null then
    raise exception 'No autenticado.';
  end if;

  if not public.tiene_membresia_activa(v_user) then
    raise exception 'Necesitás una membresía activa para participar en sorteos.';
  end if;

  select * into v_sorteo from public.sorteos where id = p_sorteo_id for update;
  if not found then
    raise exception 'Sorteo no encontrado.';
  end if;
  if v_sorteo.estado <> 'activo' or v_sorteo.cierre <= now() then
    raise exception 'Este sorteo ya está cerrado.';
  end if;

  select coalesce(sum(cardinality(numeros)), 0) into v_asignados
    from public.inscripciones where sorteo_id = p_sorteo_id;
  if v_asignados >= v_sorteo.numeros_en_juego then
    raise exception 'No quedan números disponibles.';
  end if;

  select creditos into v_saldo from public.profiles where id = v_user for update;
  if v_saldo < v_sorteo.costo_creditos then
    raise exception 'Créditos insuficientes. Te faltan % créditos.',
      v_sorteo.costo_creditos - v_saldo;
  end if;

  perform set_config('app.allow_credit_change', 'on', true);

  update public.profiles
    set creditos = creditos - v_sorteo.costo_creditos
    where id = v_user;

  v_numero := v_asignados + 1;

  insert into public.inscripciones (sorteo_id, user_id, numeros)
  values (p_sorteo_id, v_user, array[v_numero])
  on conflict (sorteo_id, user_id)
  do update set numeros = public.inscripciones.numeros || v_numero;

  insert into public.movimientos (user_id, tipo, detalle, creditos)
  values (
    v_user, 'inscripcion_sorteo',
    'Inscripción en "' || v_sorteo.titulo || '" (número ' || v_numero || ')',
    -v_sorteo.costo_creditos
  );

  return v_numero;
end;
$$;

create or replace function public.cargar_creditos(p_target uuid, p_monto integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_nombre text;
begin
  if not public.is_admin() then
    raise exception 'Solo un administrador puede cargar créditos.';
  end if;
  if p_monto is null or p_monto <= 0 then
    raise exception 'El monto debe ser mayor a 0.';
  end if;
  if not exists (select 1 from public.profiles where id = p_target) then
    raise exception 'Usuario destino no encontrado.';
  end if;

  select nombre into v_admin_nombre from public.profiles where id = auth.uid();

  perform set_config('app.allow_credit_change', 'on', true);

  update public.profiles set creditos = creditos + p_monto where id = p_target;

  insert into public.movimientos (user_id, tipo, detalle, creditos)
  values (
    p_target, 'carga_creditos',
    'Carga de créditos realizada por ' || coalesce(v_admin_nombre, 'un administrador'),
    p_monto
  );
end;
$$;
