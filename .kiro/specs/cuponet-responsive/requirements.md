# Requisitos — Diseño Responsive (móvil · tablet · desktop)

## Introducción

Cuponet fue diseñado mobile-first con un ancho máximo fijo (`max-w-md`). En tablet y desktop el contenido queda encerrado en una columna estrecha rodeada de espacio en blanco. Este trabajo adapta toda la app (cliente + admin) para aprovechar el espacio disponible en pantallas más grandes, sin romper la experiencia móvil existente.

## Breakpoints

Usamos los de Tailwind (que ya está configurado):
- **Móvil**: < 768px (`base`) → experiencia actual, sin cambios.
- **Tablet**: 768px–1023px (`md`) → layout de dos columnas donde corresponde.
- **Desktop**: ≥ 1024px (`lg`) → layout amplio con sidebar fijo en admin.

## Principios

- Mobile-first: el CSS base es el de móvil; los breakpoints agregan comportamiento para pantallas mayores.
- No romper la experiencia de móvil existente.
- Sin librerías nuevas: solo clases de Tailwind.
- Coherencia visual: mismos tokens de color, componentes shadcn, tipografía.

---

## Requisitos

### RR1 — Contenedor global

**Historia:** Como usuario en desktop/tablet, quiero que el contenido ocupe el ancho disponible, para no ver una columna estrecha rodeada de espacio en blanco.

#### Criterios de aceptación
1. EL contenedor raíz DEBERÁ eliminar `max-w-md` en pantallas ≥ md y pasar a `max-w-screen-xl` centrado.
2. EN móvil, el comportamiento actual (columna centrada ~448px) DEBERÁ conservarse.
3. EL padding horizontal DEBERÁ escalar: `px-4` en móvil → `px-8` en md → `px-12` en lg.

### RR2 — Layout de la app cliente (tablet/desktop)

**Historia:** Como cliente en desktop, quiero una experiencia cómoda con más contenido visible, sin que parezca una app móvil estirada.

#### Criterios de aceptación
1. EN tablet/desktop, la bottom nav DEBERÁ convertirse en una **sidebar izquierda** visible (nav lateral fija).
2. EL contenido principal DEBERÁ ocupar el espacio restante a la derecha de la sidebar.
3. LOS grids de tarjetas (cupones, sorteos, accesos del home) DEBERÁN usar más columnas en pantallas grandes (2 col en md, 3 col en lg).
4. EL header DEBERÁ mantener su comportamiento sticky pero expandirse al ancho completo.
5. LA bottom nav DEBERÁ ocultarse en tablet/desktop (`hidden md:hidden` → visible solo en móvil).

### RR3 — Layout del panel admin (tablet/desktop)

**Historia:** Como admin en desktop, quiero un panel con sidebar lateral fijo y contenido amplio, como un panel de administración profesional.

#### Criterios de aceptación
1. EN tablet/desktop, la bottom nav del admin DEBERÁ reemplazarse por un **sidebar izquierdo fijo** con la navegación agrupada (Dashboard · Gestión · Operación · Métricas).
2. EL sidebar DEBERÁ mostrar ícono + label en desktop; solo ícono en tablet (colapsado).
3. EL contenido de cada sección DEBERÁ ocupar el espacio restante.
4. EN móvil, la bottom nav actual del admin DEBERÁ conservarse sin cambios.
5. EL admin NO DEBERÁ ver ninguna pantalla ni navegación del cliente. Su experiencia es 100% el panel admin.

### RR4 — Grids y tarjetas responsive

**Historia:** Como usuario, quiero que los listados aprovechen el espacio horizontal en pantallas grandes.

#### Criterios de aceptación
1. EL listado de **cupones** DEBERÁ mostrar 1 col en móvil, 2 en md, 3 en lg.
2. EL listado de **sorteos** DEBERÁ mostrar 1 col en móvil, 2 en md, 3 en lg.
3. LAS tarjetas del **dashboard** (métricas) DEBERÁN mostrar 2 col en móvil, 3 en md, 4 en lg.
4. LAS tarjetas del home (accesos cupones/sorteos) DEBERÁN mostrar 2 col en móvil/md, 3 en lg.
5. LA tabla/lista de **usuarios** en admin DEBERÁ mostrar más información por fila en desktop.
6. LOS formularios de creación/edición (cupones, sorteos, comercios) DEBERÁN usar layout de 2 columnas en md+.

### RR5 — Tipografía y espaciado

#### Criterios de aceptación
1. LOS títulos de sección DEBERÁN escalar: `text-lg` en móvil → `text-xl` en md → `text-2xl` en lg.
2. EL espaciado entre secciones DEBERÁ aumentar en desktop (`gap-4` → `gap-6` en md → `gap-8` en lg).

### RR6 — No regresión

#### Criterios de aceptación
1. EN móvil (< 768px), la app DEBERÁ verse y comportarse igual que antes de este cambio.
2. `npm run build` DEBERÁ pasar sin errores.
3. Las funcionalidades existentes NO DEBERÁN verse afectadas.

---

## Fuera de alcance
- Rediseño visual de componentes individuales (solo layout y grid).
- Modo landscape específico para móvil.
- Gestos de swipe o menús hamburguesa animados (el sidebar colapsa a bottom nav en móvil, sin animaciones complejas).
