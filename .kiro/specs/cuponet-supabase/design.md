# Diseño — Cuponet con Supabase

## Resumen

Se reemplaza la capa mock en memoria por **Supabase** (Postgres + Auth + RLS). La UI y las firmas de los servicios se conservan; cambia la implementación interna (ahora asíncrona). La seguridad se mueve a la base: RLS en todas las tablas y funciones `security definer` para las operaciones que mueven créditos.

## Principios de implementación

- **Servicios asíncronos**: cada método de servicio pasa a `async` y devuelve `Promise<ServiceResult<T>>`.
- **Mapeo snake_case ↔ camelCase**: la base usa `snake_case`; la capa de servicios mapea a los tipos `camelCase` del frontend (reutilizamos `types.ts`).
- **Un único cliente** Supabase (`src/lib/supabase.ts`).
- **Errores traducidos**: los errores de Supabase se convierten a mensajes en español antes de llegar a la UI.

## Configuración del cliente

`src/lib/supabase.ts`:
- Lee `import.meta.env.VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
- Si faltan, lanza un error explícito en el arranque (fail-fast).
- Exporta una instancia única de `createClient`.

`.env.example` (versionado, sin valores):
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
`.env` (ignorado) contiene los valores reales.

## Esquema de base de datos

Enums:
```sql
create type user_role as enum ('cliente', 'admin');
create type sorteo_estado as enum ('activo', 'cerrado');
create type movimiento_tipo as enum (
  'compra_membresia', 'canje_cupon', 'inscripcion_sorteo', 'carga_creditos'
);
```

Tablas (resumen; el SQL completo va en las migraciones):

- **profiles** (1:1 con `auth.users`)
  - `id uuid pk references auth.users on delete cascade`
  - `nombre text not null`
  - `role user_role not null default 'cliente'`
  - `creditos integer not null default 0 check (creditos >= 0)`
  - `created_at timestamptz default now()`

- **planes**
  - `id text pk` ('plan1' | 'plan3' | 'black'), `nombre text`, `meses int check (meses > 0)`, `costo_creditos int check (costo_creditos >= 0)`

- **memberships**
  - `id uuid pk default gen_random_uuid()`
  - `user_id uuid not null references profiles on delete cascade`
  - `plan_id text not null references planes`
  - `inicio timestamptz not null default now()`
  - `expiracion timestamptz not null`
  - Índice/único: a lo sumo una membresía "vigente" relevante por usuario; se consulta la de mayor `expiracion`.

- **comercios**: `id uuid pk`, `nombre text not null`, `instagram_url text`

- **cupones**
  - `id uuid pk default gen_random_uuid()`
  - `comercio_id uuid not null references comercios on delete cascade`
  - `titulo text not null`, `descripcion text`, `descuento text`, `vencimiento timestamptz not null`
  - `created_at timestamptz default now()`

- **canjes** (registro de cupones canjeados)
  - `id uuid pk`, `user_id uuid references profiles`, `cupon_id uuid references cupones`, `fecha timestamptz default now()`

- **sorteos**
  - `id uuid pk`, `titulo text not null`, `producto_principal text not null`
  - `productos_secundarios text[] not null default '{}'`
  - `cierre timestamptz not null`, `numeros_en_juego int not null check (numeros_en_juego > 0)`
  - `costo_creditos int not null check (costo_creditos >= 0)`
  - `estado sorteo_estado not null default 'activo'`

- **inscripciones**
  - `id uuid pk`, `sorteo_id uuid references sorteos on delete cascade`, `user_id uuid references profiles on delete cascade`
  - `numeros int[] not null default '{}'`
  - único `(sorteo_id, user_id)` (una fila por usuario por sorteo; los números se acumulan en el array)

- **movimientos**
  - `id uuid pk`, `user_id uuid references profiles on delete cascade`
  - `tipo movimiento_tipo not null`, `fecha timestamptz default now()`
  - `detalle text not null`, `creditos int` (nullable; +carga / -gasto)

## Trigger de creación de perfil

Al crear un usuario en `auth.users`, un trigger `handle_new_user()` inserta su fila en `profiles` con `role='cliente'`, `creditos=0` y el `nombre` tomado de `raw_user_meta_data`.

## Row Level Security (RLS)

RLS habilitado en todas las tablas. Helper:
```sql
create or replace function is_admin() returns boolean
language sql security definer stable as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;
```

Políticas (resumen):

- **profiles**: cada quien lee/actualiza SU fila (`id = auth.uid()`), pero `role` y `creditos` NO son editables por el propio usuario (se protegen: update permitido solo en `nombre`; cambios de créditos/rol solo vía funciones o admin). Admin puede leer todos.
- **planes, comercios, cupones, sorteos**: `select` para cualquier autenticado; `insert/update/delete` solo si `is_admin()`.
- **memberships**: el usuario lee las suyas; la escritura ocurre solo dentro de funciones `security definer`.
- **canjes, inscripciones, movimientos**: el usuario lee solo las propias (`user_id = auth.uid()`); admin lee todas; la escritura directa está restringida (se hace vía funciones).

## Funciones (RPC) `security definer`

Todas validan reglas y son atómicas. Devuelven JSON con `{ ok, error? , data? }` o lanzan excepción que la capa de servicios traduce.

1. **comprar_membresia(plan_id text)**
   - Usuario = `auth.uid()`. Bloquea fila del perfil (`for update`).
   - Valida saldo >= costo del plan; descuenta; inserta/renueva membership con `expiracion = now() + meses`; inserta movimiento `compra_membresia` (negativo). Error si saldo insuficiente.

2. **inscribir_sorteo(sorteo_id uuid)**
   - Valida membresía activa, sorteo activo y `cierre > now()`, cupo de números disponible, saldo >= costo.
   - Descuenta créditos, asigna número (siguiente secuencial = números asignados + 1), upsert en inscripciones (append al array), inserta movimiento `inscripcion_sorteo`.

3. **canjear_cupon(cupon_id uuid)**
   - Valida membresía activa y `vencimiento > now()`. Inserta canje + movimiento `canje_cupon` (sin tocar créditos).

4. **cargar_creditos(target_user uuid, monto int)**
   - Valida `is_admin()` y `monto > 0`. Suma créditos al destino; inserta movimiento `carga_creditos` (positivo).

Membresía activa se deriva: existe membership con `expiracion > now()` para el usuario.

## Capa de servicios (reimplementación)

Firmas conservadas, ahora `async`. Mapeo de filas a tipos del frontend.

- `authService`: `register` (signUp + metadata nombre), `login` (signInWithPassword), `logout`, `getCurrentUser` (sesión + perfil), `onAuthChange` (suscripción para el contexto). Admin: `listarClientes`/`listarUsuarios` vía select sobre `profiles` (permitido por RLS admin).
- `creditService`: `getSaldo` (select perfil), `cargar` → rpc `cargar_creditos`.
- `membershipService`: `getPlanes` (select planes), `comprarPlan` → rpc `comprar_membresia`, `esMembresiaActiva` (deriva de la membership vigente).
- `couponService`: `listarVigentes`/`getById`/`listarTodos`/`listarComercios` (select), `canjear` → rpc, CRUD admin (insert/update/delete, permitidos por RLS admin).
- `raffleService`: `listarActivos`/`getById`/`listarTodos` (select), `getInscripcion` (select propia), `inscribir` → rpc, `crear`/`actualizar`/`cerrar` (admin).
- `historyService`: `listarPorUsuario` (select propio), `listarGlobal` (admin).

Helper de mapeo `mappers.ts`: funciones puras fila→tipo (snake→camel), para no repetir y mantener legible.

## AuthContext (asíncrono)

- Al montar: `getSession()` + carga de perfil; estado `loading` inicial.
- Suscripción a `onAuthStateChange` para reaccionar a login/logout/refresh de token.
- `refreshUser()` recarga el perfil (saldo/membresía) tras operaciones.
- Mientras `loading`, las rutas protegidas muestran un spinner en vez de redirigir (evita parpadeo a /login al recargar).

## Impacto en la UI

- Las páginas que hoy leen datos sincrónicamente pasan a cargarlos en `useEffect` con estado `loading`/`error`.
- Patrón reutilizable: un hook `useAsync` (o similar) para estandarizar carga/error y no duplicar lógica en cada página.
- Las acciones (comprar, canjear, inscribir, cargar) pasan a `await` + toast.

## Estructura de archivos (nueva/afectada)

```
.env.example
supabase/
  migrations/
    0001_schema.sql        # enums, tablas, constraints, índices
    0002_rls.sql           # habilitar RLS + políticas + is_admin()
    0003_functions.sql     # trigger handle_new_user + RPCs
  seed.sql                 # planes + comercios/cupones/sorteos demo
src/
  lib/supabase.ts          # cliente único
  services/
    mappers.ts             # fila snake_case -> tipo camelCase
    *.service.ts           # reimplementados contra Supabase
    types.ts               # se conserva (fuente de tipos del frontend)
  hooks/useAsync.ts        # estado de carga/error reutilizable
```
Se eliminan: `store.ts`, `mockData.ts`, `movimientos.ts` (la lógica pasa a RPCs).

## Plan de migración (orden seguro)

1. Config (cliente + env) sin tocar lo demás.
2. Migraciones de esquema + RLS + funciones aplicadas al proyecto.
3. Seed de planes/comercios/cupones/sorteos.
4. Migrar `authService` + `AuthContext` (lo demás sigue en mock temporalmente si hiciera falta, pero se migra en bloque).
5. Migrar el resto de servicios.
6. Adaptar páginas a estados async.
7. Eliminar mock. Verificación end-to-end.

## Estrategia de verificación

- Pruebas manuales de las políticas RLS: un cliente no puede leer datos de otro ni cargarse créditos; un no-admin no puede crear cupones.
- Pruebas de las RPC: saldo insuficiente no deja efectos; inscripción respeta cupo y descuenta; carga de créditos solo admin.
- `npm run build` + recorrido del flujo completo con un usuario real y un admin.
- Confirmar que al recargar la página la sesión persiste.
