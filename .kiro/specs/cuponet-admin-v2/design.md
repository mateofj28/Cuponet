# Diseño — Panel de administración v2

## Resumen

Se reorganiza el panel admin de 4 tabs a un **layout con navegación lateral agrupada** (Opción B), se amplía el esquema de Supabase (usuarios con apellido/DNI, comercios con más campos, sorteos con `fecha_sorteo`), se agregan módulos nuevos (Dashboard, Usuarios, Estadísticas de sorteos, Comercios) y se mejoran interacciones (confirmaciones con dialog, buscador de clientes, filtros de historial).

Se reutiliza todo lo existente: servicios, mappers, `useAsync`, componentes shadcn, tokens de color. "Puntos" solo en UI; interno sigue `creditos`.

## Navegación del panel (Opción B)

Layout `AdminLayout` con **sidebar** (desktop) que colapsa a menú en móvil, con grupos:

- **Resumen**
  - Dashboard  → `/admin` (índice)
- **Gestión**
  - Usuarios   → `/admin/usuarios`
  - Comercios  → `/admin/comercios`
  - Cupones    → `/admin/cupones`   (ABM, conservado)
  - Sorteos    → `/admin/sorteos`   (ABM, conservado)
- **Operación**
  - Cargar puntos → `/admin/creditos`
  - Historial     → `/admin/historial`
- **Métricas**
  - Estadísticas de sorteos → `/admin/estadisticas`

Rutas hijas de `/admin` bajo `AdminRoute` + `AppShell`. Se usa `react-router` con rutas anidadas y `<Outlet>`. En móvil, el sidebar se vuelve un menú desplegable (reutilizar `Sheet` o `DropdownMenu` de shadcn). Componente shadcn `sidebar` disponible si se decide usarlo.

> El ABM de cupones y sorteos NO se elimina: se mueve a `/admin/cupones` y `/admin/sorteos`. "Estadísticas" es una vista aparte de solo lectura.

## Cambios de esquema (nueva migración `0006_admin_v2.sql`)

### profiles
```sql
alter table public.profiles add column apellido text;
alter table public.profiles add column dni text unique;
```
- Nullables para no romper usuarios existentes. El registro nuevo los exige (validación en servicio/UI).
- Índice en `dni` (lo da el unique).

### comercios
```sql
alter table public.comercios add column descripcion text not null default '';
alter table public.comercios add column direccion text;
alter table public.comercios add column telefono text;
alter table public.comercios add column email text;
alter table public.comercios add column activo boolean not null default true;
alter table public.comercios add column created_at timestamptz not null default now();
```
- RLS: lectura para autenticados (ya existe); escritura solo admin (ya existe la policy `comercios_admin_write`). Se mantiene.

### sorteos
```sql
alter table public.sorteos add column fecha_sorteo timestamptz;
-- backfill: para sorteos existentes, fecha_sorteo = cierre
update public.sorteos set fecha_sorteo = cierre where fecha_sorteo is null;
alter table public.sorteos alter column fecha_sorteo set not null;
alter table public.sorteos add constraint sorteos_fecha_posterior
  check (fecha_sorteo >= cierre);
```

### Trigger de alta de usuario
Actualizar `handle_new_user` para leer también `apellido` y `dni` desde `raw_user_meta_data`.

### Funciones de métricas (RPC, security definer, solo admin)
Para el dashboard y estadísticas, funciones que agregan datos (evitan traer todo al cliente):
- `admin_dashboard_metrics()` → json con: total_usuarios, nuevos_hoy, membresias_activas, cupones_canjeados_hoy, sorteos_activos, sorteos_finalizados, puntos_cargados_hoy.
- `admin_puntos_cargados_semana()` → serie de 7 días (fecha, total) para el gráfico.
- `admin_sorteo_stats(desde, hasta, estado)` → json con totales de sorteos/participaciones/usuarios/puntos.
Cada una valida `is_admin()` al inicio (raise si no). Así las métricas son confiables y no dependen de que el cliente sume bien.

## Capa de servicios (nuevos / ampliados)

- `authService.register`: aceptar `apellido`, `dni`; pasarlos en metadata.
- `adminService` (nuevo): `dashboardMetrics()`, `puntosCargadosSemana()`, `sorteoStats(filtros)`, `buscarUsuarios(query)` (para RA5, por email/dni), `listarUsuarios(filtros)` (RA3).
- `comercioService` (nuevo o ampliar coupon.service.listarComercios): `listar()`, `crear()`, `actualizar()`, `toggleActivo()`, `eliminar()`.
- `raffleService`: `crear`/`actualizar` aceptan `fechaSorteo`; mapear en `mappers`.
- `historyService.listarGlobal(tipo?)`: filtro opcional por `movimiento_tipo`.

Todos mantienen `ServiceResult<T>` y el patrón async. Mappers nuevos para comercio ampliado y perfil con apellido/dni.

## Tipos (types.ts / mappers)

- `User`: + `apellido?`, `dni?`.
- `Comercio`: + `descripcion`, `direccion?`, `telefono?`, `email?`, `activo`, `createdAt`.
- `Sorteo`: + `fechaSorteo`.
- Nuevos tipos para métricas (`DashboardMetrics`, `SorteoStats`, `UsuarioAdmin`).

## Componentes nuevos (en `src/components/admin/`)

- `AdminLayout` (sidebar + outlet, responsive).
- `AdminDashboard` (tarjetas de métricas + gráfico).
- `AdminUsuarios` (tabla + filtros/búsqueda).
- `AdminEstadisticas` (métricas de sorteos + filtros de fecha/estado).
- `AdminComercios` (CRUD con dialog + confirmación de borrado).
- `ConfirmDialog` (reutilizable: título, descripción, Cancelar/Confirmar) — usado por cupones (RA6), sorteos (RA8) y comercios (RA7).
- `UserSearch` (input con autocompletado para RA5).
- Gráfico: usar un componente simple (los `chart` de shadcn/recharts si ya están, o barras con divs si se quiere evitar dependencia; decidir en implementación según lo instalado).

## Reutilización

- `ConfirmDialog` unifica las confirmaciones (cupón, sorteo, comercio) — un solo componente, no tres.
- `useAsync` para toda carga de datos (dashboard, usuarios, estadísticas, comercios).
- Tokens de color y `statusBadge` existentes para estados (activo/inactivo, etc.).
- `formatCreditos` para mostrar puntos.

## Terminología UI

Donde hoy dice "créditos" de cara al usuario/admin, pasa a decir **"puntos"** (labels, títulos, mensajes). Interno sin cambios. Revisar textos en: carga de puntos, dashboard, estadísticas, historial, membresía, etc.

## Estados y validaciones

- Carga (spinner), vacío (mensaje), error (toast) en todos los módulos de datos.
- Validaciones: DNI formato y unicidad (error claro si duplicado); `fecha_sorteo >= cierre`; campos obligatorios en comercios.
- Filtros y búsqueda ejecutan contra la base (no filtrado ficticio).

## Estrategia de verificación

- Migración aplicada y verificada (columnas, constraint, funciones).
- Cada módulo: probar con datos reales (crear comercio, buscar usuario por DNI, filtrar historial, etc.).
- Confirmaciones: cancelar no ejecuta; confirmar sí.
- `npm run build` sin errores; módulos existentes (cliente) intactos.
- Métricas cruzadas contra consultas SQL directas para confirmar que no hay números inventados.

## Orden de implementación (resumen)

Esquema → servicios/tipos → layout del panel → módulos (dashboard, usuarios, comercios, estadísticas) → mejoras (buscador, confirmaciones, fecha sorteo, filtros historial) → terminología "puntos" → verificación.
