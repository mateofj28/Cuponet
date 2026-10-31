-- =============================================================
-- Cuponet · 0006 · Panel admin v2 — ampliación de esquema
-- profiles: apellido + dni (único)
-- comercios: descripcion, direccion, telefono, email, activo, created_at
-- sorteos: fecha_sorteo (anuncio del premio), >= cierre
-- Actualiza handle_new_user para tomar apellido y dni del metadata.
-- =============================================================

-- ---------- profiles ----------
alter table public.profiles add column if not exists apellido text;
alter table public.profiles add column if not exists dni text;

-- DNI único cuando está presente (permite nulls en usuarios viejos).
create unique index if not exists profiles_dni_unique
  on public.profiles (dni)
  where dni is not null;

comment on column public.profiles.dni is 'Documento del usuario. Único cuando está presente.';

-- ---------- comercios ----------
alter table public.comercios add column if not exists descripcion text not null default '';
alter table public.comercios add column if not exists direccion text;
alter table public.comercios add column if not exists telefono text;
alter table public.comercios add column if not exists email text;
alter table public.comercios add column if not exists activo boolean not null default true;
alter table public.comercios add column if not exists created_at timestamptz not null default now();

-- ---------- sorteos ----------
-- Fecha en que se anuncia el premio (distinta del cierre de inscripciones).
alter table public.sorteos add column if not exists fecha_sorteo timestamptz;

-- Backfill: sorteos existentes -> fecha_sorteo = cierre.
update public.sorteos set fecha_sorteo = cierre where fecha_sorteo is null;

-- Ahora que todos tienen valor, la hacemos obligatoria.
alter table public.sorteos alter column fecha_sorteo set not null;

-- Regla de negocio: el anuncio no puede ser antes del cierre de inscripciones.
alter table public.sorteos drop constraint if exists sorteos_fecha_posterior;
alter table public.sorteos add constraint sorteos_fecha_posterior
  check (fecha_sorteo >= cierre);

comment on column public.sorteos.cierre is 'Cierre de inscripciones.';
comment on column public.sorteos.fecha_sorteo is 'Fecha de anuncio del premio (>= cierre).';

-- ---------- Trigger de alta: tomar apellido y dni del metadata ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, apellido, dni, role, creditos)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'apellido',
    new.raw_user_meta_data ->> 'dni',
    'cliente',
    0
  );
  return new;
end;
$$;
