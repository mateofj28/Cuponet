# Diseño — Responsive

## Resumen

Se elimina el `max-w-md` global, se crea un sistema de layout responsive con dos shells distintos (cliente y admin), se reemplaza la bottom nav por sidebar lateral en md+, y se actualizan los grids de tarjetas para usar columnas adicionales en tablet y desktop.

## Breakpoints Tailwind usados

| Prefijo | Mínimo | Dispositivo |
|---------|--------|-------------|
| (base)  | 0px    | Móvil       |
| `md`    | 768px  | Tablet      |
| `lg`    | 1024px | Desktop     |
| `xl`    | 1280px | Desktop amplio |

---

## 1. Contenedor raíz

**Antes:**
```
<div className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background">
```

**Después:**
```
<div className="mx-auto flex min-h-svh w-full max-w-md md:max-w-none flex-col bg-background">
```

En móvil: mantiene max-w-md (columna centrada).
En md+: `max-w-none` + padding lateral escalado.

---

## 2. AppShell — cliente

### Móvil (sin cambios)
- Header sticky, contenido en columna, bottom nav fija abajo.

### Tablet/Desktop (md+)
- La bottom nav se **oculta** (`hidden md:hidden` → `md:hidden`).
- Aparece una **sidebar izquierda** (`aside`) con nav vertical.
- El layout raíz pasa a `flex-row`.
- El `main` toma `flex-1 overflow-auto`.

```
┌──────────────────────────────────────────────────────┐
│  Header (sticky, ancho completo)                     │
├─────────┬────────────────────────────────────────────┤
│ Sidebar │  Contenido principal                       │
│  nav    │  (flex-1, padding interno)                 │
│  w-56   │                                            │
└─────────┴────────────────────────────────────────────┘
```

Sidebar cliente: Inicio · Cupones · Sorteos · Historial (mismo que bottom nav).
Width: `w-16` en tablet (solo íconos) · `w-56` en desktop (ícono + label).

---

## 3. AppShell — admin (AdminShell)

### Móvil (sin cambios)
- Bottom nav de admin (Dashboard · Gestión · Operación · Métricas).

### Tablet/Desktop (md+)
- Sidebar izquierda fija con los grupos Resumen/Gestión/Operación/Métricas.
- `w-16` en md (solo íconos + tooltips) · `w-64` en lg (íconos + labels + grupos).
- Bottom nav oculta.

```
┌─────────────────────────────────────────────────────────┐
│  Header admin (sticky, ancho completo)                  │
├──────────┬──────────────────────────────────────────────┤
│ Sidebar  │  Contenido de la sección activa              │
│ admin    │  (padding px-6 md, px-8 lg)                  │
│  w-16    │                                              │
│ (md)     │                                              │
│  w-64    │                                              │
│ (lg)     │                                              │
└──────────┴──────────────────────────────────────────────┘
```

Implementación: un único `AppShell.tsx` con `isAdmin` ya existente, que elige qué sidebar renderizar.

---

## 4. Grids de tarjetas

| Componente | Móvil | Tablet (md) | Desktop (lg) |
|---|---|---|---|
| Dashboard métricas | `grid-cols-2` | `grid-cols-3` | `grid-cols-4` |
| Home accesos | `grid-cols-2` | `grid-cols-2` | `grid-cols-3` |
| Cupones listado | `grid-cols-1` | `grid-cols-2` | `grid-cols-3` |
| Sorteos listado | `grid-cols-1` | `grid-cols-2` | `grid-cols-3` |
| Estadísticas métricas | `grid-cols-2` | `grid-cols-3` | `grid-cols-4` |

---

## 5. Formularios (md+)

Los formularios de crear/editar (sorteos, cupones, comercios) pasan a layout de 2 columnas en md+:
- Columna izquierda: campos principales (título, nombre, descripción).
- Columna derecha: campos secundarios (fechas, precios, estado).

---

## 6. Lista de usuarios (admin, md+)

En tablet/desktop, el componente `AdminUsuarios` muestra los datos como tabla HTML responsive en vez de tarjetas apiladas:
- Columnas: Nombre/Apellido · Email · DNI · Plan · Membresía · Saldo · Utilizados · Fecha.
- En móvil: mantiene tarjetas.

---

## 7. Tipografía y espaciado

Clases que escalan:
- Títulos: `text-lg md:text-xl lg:text-2xl`
- Gap de secciones: `gap-4 md:gap-6 lg:gap-8`
- Padding de página: `p-4 md:p-6 lg:p-8`

---

## Archivos afectados

```
src/
  components/
    layout/
      AppShell.tsx          ← layout responsive + sidebar dual
      ClienteSidebar.tsx    ← sidebar lateral del cliente (nuevo)
      AdminSidebar.tsx      ← sidebar lateral del admin (nuevo)
  pages/
    Home.tsx                ← grid accesos 3 cols en lg
    Cupones.tsx             ← grid 2/3 cols
    Sorteos.tsx             ← grid 2/3 cols
  components/admin/
    AdminDashboard.tsx      ← grid métricas 3/4 cols
    AdminUsuarios.tsx       ← tabla en md+, tarjetas en móvil
    AdminEstadisticas.tsx   ← grid métricas 3/4 cols
    AdminGestion.tsx        ← formularios 2 cols en md+
    AdminCupones.tsx        ← form 2 cols en md+
    AdminSorteos.tsx        ← form 2 cols en md+
    AdminComercios.tsx      ← form 2 cols en md+
```

---

## Estrategia de verificación

- Probar en Chrome DevTools con viewport de 375px, 768px y 1440px.
- Confirmar que la bottom nav aparece solo en móvil y la sidebar solo en md+.
- Verificar que los grids muestran el número correcto de columnas por breakpoint.
- `npm run build` sin errores.
- Confirmar no-regresión en móvil.
