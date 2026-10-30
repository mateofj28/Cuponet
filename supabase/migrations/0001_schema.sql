-- =============================================================
-- Cuponet · 0001 · Esquema base
-- Enums, tablas, claves, restricciones e índices del dominio.
-- (ver .kiro/specs/cuponet-supabase/design.md)
-- =============================================================

-- ---------- Enums ----------
create type user_role as enum ('cliente', 'admin');
create type sorteo_estado as enum ('activo', 'cerrado');
create type movimiento_tipo as enum (
  'compra_membresia',
  'canje_cupon',
  'inscripcion_sorteo',
  'carga_creditos'
);

-- ---------- profiles (1:1 con auth.users) ----------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nombre      text not null,
  role        user_role not null default 'cliente',
  creditos    integer not null default 0 check (creditos >= 0),
  created_at  timestamptz not null default now()
);

comment on table public.profiles is 'Perfil de cada usuario autenticado (rol, saldo de créditos).';
comment on column public.profiles.creditos is 'Saldo de créditos. Nunca negativo (check). Solo el admin lo carga vía RPC.';

-- ---------- planes ----------
create table public.planes (
  id              text primary key,                 -- 'plan1' | 'plan3' | 'black'
  nombre          text not null,
  meses           integer not null check (meses > 0),
  costo_creditos  integer not null check (costo_creditos >= 0)
);

comment on table public.planes is 'Catálogo de planes de membresía.';

-- ---------- memberships ----------
create table public.memberships (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles (id) on delete cascade,
  plan_id     text not null references public.planes (id),
  inicio      timestamptz not null default now(),
  expiracion  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index memberships_user_idx on public.memberships (user_id);
create index memberships_user_exp_idx on public.memberships (user_id, expiracion desc);

comment on table public.memberships is 'Membresías compradas. La vigente es la de mayor expiracion por usuario.';

-- ---------- comercios ----------
create table public.comercios (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  instagram_url text
);

comment on table public.comercios is 'Comercios asociados que ofrecen cupones.';

-- ---------- cupones ----------
create table public.cupones (
  id           uuid primary key default gen_random_uuid(),
  comercio_id  uuid not null references public.comercios (id) on delete cascade,
  titulo       text not null,
  descripcion  text not null default '',
  descuento    text not null default '',
  vencimiento  timestamptz not null,
  created_at   timestamptz not null default now()
);

create index cupones_comercio_idx on public.cupones (comercio_id);
create index cupones_venc_idx on public.cupones (vencimiento);

comment on table public.cupones is 'Cupones de descuento. Vigentes si vencimiento > now().';

-- ---------- canjes ----------
create table public.canjes (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references public.profiles (id) on delete cascade,
  cupon_id  uuid not null references public.cupones (id) on delete cascade,
  fecha     timestamptz not null default now()
);

create index canjes_user_idx on public.canjes (user_id);

comment on table public.canjes is 'Registro de cupones canjeados por usuario.';

-- ---------- sorteos ----------
create table public.sorteos (
  id                     uuid primary key default gen_random_uuid(),
  titulo                 text not null,
  producto_principal     text not null,
  productos_secundarios  text[] not null default '{}',
  cierre                 timestamptz not null,
  numeros_en_juego       integer not null check (numeros_en_juego > 0),
  costo_creditos         integer not null check (costo_creditos >= 0),
  estado                 sorteo_estado not null default 'activo',
  created_at             timestamptz not null default now()
);

create index sorteos_estado_idx on public.sorteos (estado);

comment on table public.sorteos is 'Sorteos. Activos hasta cierre; luego cerrados.';

-- ---------- inscripciones ----------
create table public.inscripciones (
  id         uuid primary key default gen_random_uuid(),
  sorteo_id  uuid not null references public.sorteos (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  numeros    integer[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (sorteo_id, user_id)
);

create index inscripciones_sorteo_idx on public.inscripciones (sorteo_id);
create index inscripciones_user_idx on public.inscripciones (user_id);

comment on table public.inscripciones is 'Una fila por (sorteo, usuario); los números se acumulan en el array.';

-- ---------- movimientos ----------
create table public.movimientos (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references public.profiles (id) on delete cascade,
  tipo      movimiento_tipo not null,
  fecha     timestamptz not null default now(),
  detalle   text not null,
  creditos  integer           -- +carga / -gasto; null si no aplica
);

create index movimientos_user_fecha_idx on public.movimientos (user_id, fecha desc);

comment on table public.movimientos is 'Historial de transacciones del usuario.';
