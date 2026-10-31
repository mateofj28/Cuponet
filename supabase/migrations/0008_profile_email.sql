-- =============================================================
-- Cuponet · 0008 · Email espejo en profiles
-- El email vive en auth.users (no accesible por RLS desde el cliente).
-- Para la gestión de usuarios y la búsqueda por email del admin, se guarda
-- una copia del email en profiles, poblada por el trigger de alta.
-- =============================================================

alter table public.profiles add column if not exists email text;

-- Backfill de usuarios existentes desde auth.users.
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is null;

-- Índice para búsquedas por email (RA5).
create index if not exists profiles_email_idx on public.profiles (lower(email));

-- Actualizar el trigger para guardar también el email al registrarse.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, apellido, dni, email, role, creditos)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'apellido',
    new.raw_user_meta_data ->> 'dni',
    new.email,
    'cliente',
    0
  );
  return new;
end;
$$;
