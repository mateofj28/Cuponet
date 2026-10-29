# Plan de implementación — Cuponet MVP

- [x] 1. Preparar base del proyecto (routing, estado, librerías de utilidad)
  - Instalar React Router v7, date-fns.
  - Agregar componentes shadcn base: button, card, input, label, badge, dialog, tabs, table, sonner, avatar, separator, select, dropdown-menu.
  - Montar `<RouterProvider>` / rutas en `App.tsx` y el `<Toaster>` de sonner.
  - _Requisitos: R8_

- [x] 2. Definir tipos y datos semilla del mock
  - Crear `src/services/types.ts` con todos los tipos del diseño.
  - Crear `src/services/mockData.ts`: admin + cliente de prueba (cliente con 500 créditos de regalo, sin membresía), 3 planes, comercios con cupones (incluir uno vencido), 2–3 sorteos (uno próximo a cerrar).
  - _Requisitos: R2, R3, R4, R5_

- [x] 3. Implementar capa de servicios (mock en memoria)
  - [x] 3.1 `authService` (register, login, logout, getCurrentUser) con rol cliente por defecto.
    - _Requisitos: R1_
  - [x] 3.2 `creditService` (getSaldo, cargar solo-admin) sin permitir saldo negativo.
    - _Requisitos: R5_
  - [x] 3.3 `membershipService` (getPlanes, comprarPlan con descuento de créditos + expiración + movimiento).
    - _Requisitos: R2_
  - [x] 3.4 `couponService` (listarVigentes, getById, canjear gratis con membresía activa + movimiento).
    - _Requisitos: R3_
  - [x] 3.5 `raffleService` (listarActivos, getById, inscribir con créditos + asignación de números, cerrar al vencer).
    - _Requisitos: R4_
  - [x] 3.6 `historyService` (listarPorUsuario ordenado desc, listarGlobal).
    - _Requisitos: R6, R7_

- [x] 4. Estado global y rutas protegidas
  - Crear `AuthContext` (user, isAuthenticated, isAdmin, membresiaActiva, login/logout, refresco de user).
  - Crear `ProtectedRoute`, `MembershipRoute`, `AdminRoute`.
  - _Requisitos: R1, R2_

- [x] 5. Autenticación (UI)
  - Páginas `Login` y `Registro` con shadcn form + validación; manejo de credenciales inválidas.
  - _Requisitos: R1_

- [x] 6. Layout móvil (AppShell)
  - Header con saldo de créditos y estado de membresía; bottom nav (Inicio, Cupones, Sorteos, Historial) + acceso Admin según rol; contenedor centrado tipo móvil.
  - _Requisitos: R5, R8_

- [x] 7. Menú principal (Home)
  - Accesos a cupones, sorteos y publicidad; mostrar estado de membresía.
  - _Requisitos: R2_

- [x] 8. Membresías (UI)
  - Página de planes (costo en créditos + duración), compra con validación de saldo, estado y vencimiento; bloqueo/redirección si está vencida.
  - _Requisitos: R2_

- [x] 9. Cupones (UI)
  - Listado de cupones vigentes; detalle (promoción, descuento, vencimiento, link Instagram en pestaña nueva); canje gratis con membresía activa; impedir canje de vencidos.
  - _Requisitos: R3_

- [x] 10. Sorteos (UI)
  - Listado con producto principal/secundarios, cuenta regresiva (date-fns), números en juego; detalle con inscripción (descuento de créditos, asignación de números), números asignados; cierre al llegar a cero.
  - _Requisitos: R4_

- [x] 11. Historial (UI)
  - Lista de movimientos del usuario (tipo, fecha, detalle, créditos) ordenada del más reciente al más antiguo; estado vacío.
  - _Requisitos: R6_

- [x] 12. Panel Administrador
  - [x] 12.1 Acceso solo-admin + layout del panel con tabs.
    - _Requisitos: R7_
  - [x] 12.2 Cargar créditos a un usuario (suma saldo + movimiento).
    - _Requisitos: R5, R7_
  - [x] 12.3 ABM de cupones (crear, editar, dar de baja).
    - _Requisitos: R7_
  - [x] 12.4 ABM de sorteos (crear, editar, cerrar).
    - _Requisitos: R7_
  - [x] 12.5 Historial global de movimientos.
    - _Requisitos: R6, R7_

- [x] 13. Ajustes finales y verificación
  - Revisar flujo completo end-to-end (registro → admin carga créditos / regalo → compra membresía → canje cupón → inscripción sorteo → historial).
  - `npm run build` sin errores; revisar responsive.
  - _Requisitos: R1–R8_
