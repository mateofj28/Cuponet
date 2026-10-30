# Backend: Supabase

Cuponet usa **Supabase** (Postgres + Auth + RLS) como backend. Este steering fija las reglas no negociables para trabajar con él.

## Secretos y configuración

- **NUNCA** commitear claves al repo. Ni la `anon` key, ni (muchísimo menos) la `service_role` key.
- La configuración del cliente va en variables de entorno con prefijo `VITE_` (requerido por Vite para exponerlas al frontend):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- El archivo `.env` está en `.gitignore`. Se versiona un `.env.example` con los nombres de las variables (sin valores).
- La `service_role` key **jamás** se usa en el frontend. Solo en entornos de servidor controlados (migraciones, scripts admin). Nunca en código de la app web.
- En Vercel, las variables se cargan en Project Settings → Environment Variables, no en el repo.

## Seguridad de datos (RLS)

- **Row Level Security (RLS) es obligatorio** en TODAS las tablas con datos de usuario. Una tabla sin RLS habilitado se considera un bug de seguridad.
- El frontend NO es confiable: toda regla de negocio sensible (descontar créditos, validar membresía activa, "solo admin carga créditos") se valida en la base de datos (políticas RLS + funciones), no solo en React.
- Operaciones que mutan saldo o estado crítico (comprar membresía, inscribirse a sorteo, cargar créditos) se implementan como **funciones de Postgres (RPC) `security definer`** para que sean atómicas y no manipulables desde el cliente.
- El rol de un usuario (`cliente` / `admin`) vive en la base (tabla `profiles`), nunca se confía en un valor enviado por el cliente.

## Esquema y migraciones

- El esquema se gestiona con **migraciones SQL versionadas** en `supabase/migrations/`, no editando tablas a mano en el dashboard. Así el esquema es reproducible y revisable.
- Cada cambio de esquema = una migración nueva con nombre descriptivo. No se reescriben migraciones ya aplicadas.
- Nombres en la base: tablas y columnas en `snake_case`. La capa de servicios mapea a los tipos `camelCase` del frontend.

## Capa de acceso a datos

- Toda la comunicación con Supabase pasa por la **capa de servicios** (`src/services/`). Los componentes de UI nunca llaman al cliente de Supabase directamente.
- Se mantiene el contrato `ServiceResult<T>` (`{ ok, data } | { ok, error }`) para que la UI no cambie al migrar del mock a Supabase.
- Errores de Supabase se traducen a mensajes claros en español para el usuario; no se filtran mensajes crudos del backend a la UI.

## Calidad

- Código legible, tipado estricto (tipos generados desde el esquema cuando sea posible), sin duplicación.
- Validaciones tanto en cliente (UX inmediata) como en la base (seguridad real). La del cliente nunca reemplaza la del backend.
