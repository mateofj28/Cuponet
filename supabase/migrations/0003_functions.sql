-- =============================================================
-- Cuponet · 0003 · Trigger de alta + funciones transaccionales (RPC)
-- Operaciones que mueven créditos: atómicas, security definer,
-- validadas en la base (no manipulables desde el cliente).
-- Convención: devuelven void y lanzan EXCEPTION con mensaje en
-- español; la capa de servicios traduce a ServiceResult.
-- =============================================================

-- ---------- Alta de perfil al registrarse ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, role, creditos)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    'cliente',
    0
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Helper interno: ¿membresía activa? ----------
create or replace function public.tiene_membresia_activa(p_user uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.memberships
    where user_id = p_user and expiracion > now()
  );
$$;

-- ---------- comprar_membresia ----------
create or replace function public.comprar_membresia(p_plan_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user     uuid := auth.uid();
  v_plan     public.planes%rowtype;
  v_saldo    integer;
begin
  if v_user is null then
    raise exception 'No autenticado.';
  end if;

  select * into v_plan from public.planes where id = p_plan_id;
  if not found then
    raise exception 'Plan inválido.';
  end if;

  -- Bloquea la fila del perfil para evitar condiciones de carrera.
  select creditos into v_saldo from public.profiles
    where id = v_user for update;

  if v_saldo < v_plan.costo_creditos then
    raise exception 'Créditos insuficientes. Te faltan % créditos.',
      v_plan.costo_creditos - v_saldo;
  end if;

  update public.profiles
    set creditos = creditos - v_plan.costo_creditos
    where id = v_user;

  insert into public.memberships (user_id, plan_id, inicio, expiracion)
  values (
    v_user, v_plan.id, now(),
    now() + make_interval(months => v_plan.meses)
  );

  insert into public.movimientos (user_id, tipo, detalle, creditos)
  values (
    v_user, 'compra_membresia',
    'Compra de ' || v_plan.nombre || ' (' || v_plan.meses || ' mes/es)',
    -v_plan.costo_creditos
  );
end;
$$;

-- ---------- canjear_cupon ----------
create or replace function public.canjear_cupon(p_cupon_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user    uuid := auth.uid();
  v_cupon   public.cupones%rowtype;
  v_nombre  text;
begin
  if v_user is null then
    raise exception 'No autenticado.';
  end if;

  if not public.tiene_membresia_activa(v_user) then
    raise exception 'Necesitás una membresía activa para canjear cupones.';
  end if;

  select * into v_cupon from public.cupones where id = p_cupon_id;
  if not found then
    raise exception 'Cupón no encontrado.';
  end if;
  if v_cupon.vencimiento <= now() then
    raise exception 'Este cupón está vencido.';
  end if;

  select nombre into v_nombre from public.comercios where id = v_cupon.comercio_id;

  insert into public.canjes (user_id, cupon_id) values (v_user, p_cupon_id);

  insert into public.movimientos (user_id, tipo, detalle)
  values (
    v_user, 'canje_cupon',
    'Canje de "' || v_cupon.titulo || '"' ||
      coalesce(' en ' || v_nombre, '')
  );
end;
$$;

-- ---------- inscribir_sorteo ----------
-- Devuelve el número asignado (para el toast del frontend).
create or replace function public.inscribir_sorteo(p_sorteo_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user       uuid := auth.uid();
  v_sorteo     public.sorteos%rowtype;
  v_saldo      integer;
  v_asignados  integer;
  v_numero     integer;
begin
  if v_user is null then
    raise exception 'No autenticado.';
  end if;

  if not public.tiene_membresia_activa(v_user) then
    raise exception 'Necesitás una membresía activa para participar en sorteos.';
  end if;

  -- Bloquea la fila del sorteo para serializar la asignación de números.
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

-- ---------- cargar_creditos (solo admin) ----------
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

  update public.profiles set creditos = creditos + p_monto where id = p_target;

  insert into public.movimientos (user_id, tipo, detalle, creditos)
  values (
    p_target, 'carga_creditos',
    'Carga de créditos realizada por ' || coalesce(v_admin_nombre, 'un administrador'),
    p_monto
  );
end;
$$;

-- ---------- Permisos de ejecución ----------
grant execute on function public.comprar_membresia(text) to authenticated;
grant execute on function public.canjear_cupon(uuid) to authenticated;
grant execute on function public.inscribir_sorteo(uuid) to authenticated;
grant execute on function public.cargar_creditos(uuid, integer) to authenticated;
