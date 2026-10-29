# Diseño — Cuponet MVP

## Resumen

Aplicación web SPA en React 19 + Vite + TypeScript, UI con shadcn/ui + Tailwind v4. Toda la persistencia es **mock en memoria** detrás de una capa de servicios desacoplada, de modo que más adelante se pueda reemplazar por un backend real sin tocar la UI. El estado global (usuario, saldo, membresía) se maneja con React Context.

Modelo económico: **créditos** son la moneda interna; el admin los carga; el usuario paga **membresía** y **sorteos** con créditos; los **cupones** son gratis con membresía activa.

## Decisiones de arquitectura

| Tema | Decisión | Motivo |
|---|---|---|
| Framework | Vite + React 19 + TS | Ya montado; moderno y rápido |
| UI | shadcn/ui + Tailwind v4 | Regla de steering `ui-components` |
| Routing | React Router v7 | Estándar para SPA con rutas protegidas |
| Estado global | React Context + hooks | Suficiente para el MVP; sin librería extra |
| Datos | Capa de servicios con mock en memoria | Permite enchufar backend real luego |
| Fechas | date-fns | Manejo de vencimientos y cuenta regresiva |

> Nota: React Router, date-fns y los iconos (`lucide-react`) son librerías de utilidad, no de componentes UI; no entran en conflicto con la regla de shadcn/ui.

## Modelo de datos (tipos)

```ts
type Role = "cliente" | "admin"

interface User {
  id: string
  nombre: string
  email: string
  role: Role
  creditos: number
  membresia: Membership | null
}

type PlanId = "plan1" | "plan3" | "black"

interface Plan {
  id: PlanId
  nombre: string          // "Plan 1", "Plan 3", "Plan Black"
  meses: number           // 1, 3, 12
  costoCreditos: number
}

interface Membership {
  planId: PlanId
  inicio: string          // ISO
  expiracion: string      // ISO
  // estado se deriva: activa si now < expiracion
}

interface Comercio {
  id: string
  nombre: string
  instagramUrl: string
}

interface Cupon {
  id: string
  comercioId: string
  titulo: string
  descripcion: string
  descuento: string       // ej. "30% en comida"
  vencimiento: string     // ISO
}

interface Sorteo {
  id: string
  titulo: string
  productoPrincipal: string
  productosSecundarios: string[]
  cierre: string          // ISO -> cuenta regresiva
  numerosEnJuego: number
  costoCreditos: number   // costo por inscripción
  estado: "activo" | "cerrado"
}

interface Inscripcion {
  id: string
  sorteoId: string
  userId: string
  numeros: number[]
}

type TipoMovimiento =
  | "compra_membresia"
  | "canje_cupon"
  | "inscripcion_sorteo"
  | "carga_creditos"

interface Movimiento {
  id: string
  userId: string
  tipo: TipoMovimiento
  fecha: string           // ISO
  detalle: string
  creditos?: number       // +carga / -gasto
}
```

## Capa de datos (mock desacoplado)

Interfaces de servicio en `src/services/`. Implementación mock en memoria (arrays + `useState`/singleton), reemplazable por una implementación real más adelante con la misma firma.

```
authService      -> register, login, logout, getCurrentUser
membershipService-> getPlanes, comprarPlan(userId, planId)
couponService    -> listarVigentes, getById, canjear(userId, cuponId)
raffleService    -> listarActivos, getById, inscribir(userId, sorteoId), cerrar
creditService    -> getSaldo(userId), cargar(userId, monto)   // cargar = solo admin
historyService   -> listarPorUsuario(userId), listarGlobal()
```

Reglas de negocio clave (validadas en los servicios, no solo en UI):
- `comprarPlan`: exige créditos suficientes; descuenta; setea expiración = hoy + meses; registra movimiento.
- `canjear` cupón: exige membresía activa y cupón vigente; no descuenta créditos.
- `inscribir` sorteo: exige membresía activa, sorteo activo y créditos suficientes; descuenta; asigna números; registra movimiento.
- `cargar` créditos: solo admin; suma saldo; registra movimiento.
- Ningún saldo puede quedar negativo.

## Estado global

`AuthContext` expone: `user`, `isAuthenticated`, `isAdmin`, `membresiaActiva`, y acciones (`login`, `logout`, refresco de `user` tras operaciones que cambian saldo/membresía).

## Rutas

| Ruta | Acceso | Pantalla |
|---|---|---|
| `/login`, `/registro` | público | Autenticación |
| `/` | autenticado | Menú principal (home) |
| `/membresia` | autenticado | Planes y estado de membresía |
| `/cupones` | autenticado + membresía activa | Listado de cupones |
| `/cupones/:id` | autenticado + membresía activa | Detalle de cupón |
| `/sorteos` | autenticado + membresía activa | Listado de sorteos |
| `/sorteos/:id` | autenticado + membresía activa | Detalle / inscripción |
| `/historial` | autenticado | Movimientos del usuario |
| `/admin` | admin | Panel: créditos, cupones, sorteos, historial global |

- `ProtectedRoute`: exige sesión; redirige a `/login`.
- `MembershipRoute`: exige membresía activa; redirige a `/membresia`.
- `AdminRoute`: exige rol admin.

## Estructura de carpetas

```
src/
  components/
    ui/                 # shadcn (generado)
    layout/             # AppShell, NavBar inferior, Header
    cupones/            # CouponCard, CouponDetail
    sorteos/            # RaffleCard, Countdown, RaffleDetail
    membresia/          # PlanCard
    admin/              # formularios y tablas del panel
  context/
    AuthContext.tsx
  services/             # interfaces + mock en memoria
    types.ts
    mockData.ts         # datos semilla (comercios, cupones, sorteos)
    *.service.ts
  hooks/
  pages/                # una por ruta
  lib/
    utils.ts            # cn (shadcn)
  App.tsx               # router
  main.tsx
```

## Componentes shadcn a usar

button, card, input, label, form, dialog, badge, tabs, table, sonner (toasts), avatar, separator, dropdown-menu, select. Se agregan con `npx shadcn@latest add <componente>` según se necesiten.

## Layout móvil

AppShell responsive con navegación inferior (bottom nav) estilo app móvil para las secciones principales (Inicio, Cupones, Sorteos, Historial) y acceso a Admin cuando el rol corresponde. Contenedor centrado con ancho máximo tipo móvil.

## Manejo de errores y feedback

- Validaciones de negocio devuelven errores tipados desde los servicios; la UI los muestra con toasts (sonner) o mensajes en formularios.
- Estados vacíos (sin cupones, sin sorteos, sin movimientos) con mensajes claros.

## Datos semilla (mock)

`mockData.ts` incluye:
- 1 **admin** de prueba y 1 **cliente** de prueba.
- El cliente de prueba arranca con un **saldo inicial de regalo** (ej. 500 créditos) y **sin membresía**, para poder recorrer todo el flujo (comprar membresía → canjear cupones → inscribirse a sorteos) sin depender del admin.
- 3 **planes** con costo en créditos (ej. Plan 1 = 100, Plan 3 = 250, Black = 800).
- Varios **comercios** con cupones (algunos vigentes y uno **vencido** para probar R3.4).
- 2–3 **sorteos** activos (uno próximo a cerrar para probar R4.5).

> Nota: el saldo de regalo es solo una conveniencia del mock para el MVP. En producción el usuario arrancaría en 0 y dependería de la carga del admin.
