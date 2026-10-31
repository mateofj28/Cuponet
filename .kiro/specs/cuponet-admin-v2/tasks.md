# Plan de implementación — Panel de administración v2

- [x] 1. Migración de esquema (`0006_admin_v2.sql`) y aplicarla
  - profiles: `apellido`, `dni` (unique). comercios: descripcion/direccion/telefono/email/activo/created_at.
  - sorteos: `fecha_sorteo` (backfill = cierre, not null, check >= cierre).
  - Actualizar trigger `handle_new_user` (apellido, dni desde metadata).
  - Aplicar con `supabase db push` (requiere acción del usuario en terminal).
  - _Requisitos: RA1, RA7, RA9_

- [ ] 2. Funciones RPC de métricas (`0007_admin_metrics.sql`) y aplicarla
  - `admin_dashboard_metrics()`, `admin_puntos_cargados_semana()`, `admin_sorteo_stats(desde, hasta, estado)`. Todas validan `is_admin()`.
  - _Requisitos: RA2, RA4_

- [x] 3. Tipos y mappers
  - `User` (+apellido/dni), `Comercio` (ampliado), `Sorteo` (+fechaSorteo); tipos de métricas y `UsuarioAdmin`. Mappers correspondientes.
  - _Requisitos: RA1, RA2, RA3, RA4, RA7, RA9_

- [x] 4. Servicios
  - `authService.register` con apellido/dni. `adminService` (dashboard, semana, sorteoStats, buscarUsuarios, listarUsuarios). `comercioService` (CRUD + toggle). `raffleService` con fechaSorteo. `historyService.listarGlobal(tipo?)`.
  - Incluye migración `0008_profile_email.sql` (email espejo en profiles, requerido por gestión/búsqueda de usuarios).
  - _Requisitos: RA1–RA5, RA7, RA9, RA10_

- [x] 5. Layout del panel (sidebar agrupado, responsive)
  - `AdminLayout` con grupos Resumen/Gestión/Operación/Métricas; rutas hijas de `/admin`; colapsa en móvil.
  - Migrar las tabs actuales a rutas: creditos, cupones, sorteos, historial.
  - _Requisitos: estructura general_

- [x] 6. Componente `ConfirmDialog` reutilizable
  - Dialog genérico (título, descripción, Cancelar/Confirmar) para cupones, sorteos y comercios.
  - _Requisitos: RA6, RA7, RA8_

- [x] 7. Dashboard administrativo
  - Tarjetas de métricas (datos reales vía RPC) + gráfico de puntos cargados por día; estados carga/vacío.
  - _Requisitos: RA2_

- [x] 8. Gestión de usuarios
  - Tarjetas con datos clave + filtros/búsqueda (nombre/apellido, email, dni, rol, plan, estado membresía); carga/vacío. Referidos como "— (pendiente)".
  - _Requisitos: RA3_

- [x] 9. Estadísticas de sorteos
  - Métricas (realizados/activos/finalizados/participaciones/usuarios/puntos) con filtros fecha y estado; carga/vacío.
  - _Requisitos: RA4_

- [x] 10. Módulo de comercios (CRUD)
  - Listar/crear/editar/activar-desactivar/eliminar (con ConfirmDialog); todos los campos nuevos; carga/vacío/errores.
  - _Requisitos: RA7_

- [x] 11. Buscador de clientes en carga de puntos
  - Reemplazar el `Select` por `UserSearch` (autocompletado por email/dni); seleccionar destino; sin-resultados.
  - _Requisitos: RA5_

- [x] 12. Confirmaciones en cupones y sorteos
  - Eliminar cupón → ConfirmDialog. Cerrar sorteo → ConfirmDialog.
  - _Requisitos: RA6, RA8_

- [x] 13. Fecha de anuncio del sorteo
  - Campo `fecha_sorteo` en crear/editar (obligatorio, >= cierre).
  - Mostrar la fecha en el detalle del sorteo (cliente) y en la lista del admin.
  - _Requisitos: RA9_

- [x] 14. Filtros en historial global
  - Filtro por tipo (todos / cargas / inscripciones / membresías / cupones) en el historial del admin.
  - _Requisitos: RA10_

- [x] 15. Terminología "puntos" en la UI
  - Reemplazar "créditos" por "puntos" en labels/mensajes visibles (sin tocar base ni código interno).
  - `toErrorMessage` traduce "créditos"->"puntos" en mensajes de las RPC.
  - _Requisitos: convención de negocio_

- [ ] 16. Verificación end-to-end
  - Migraciones OK; métricas cruzadas contra SQL; confirmaciones (cancelar/confirmar); búsqueda y filtros con datos reales; registro con apellido/dni; fecha de sorteo; `npm run build` sin errores; módulos cliente intactos.
  - _Requisitos: RA1–RA10 + no funcionales_
```
