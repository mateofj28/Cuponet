# Diseño — Color y sonido en la UI

## Resumen

Dos ejes independientes:
1. **Color funcional** vía tokens de tema (CSS variables de shadcn) en `src/index.css`, aplicados con clases de Tailwind y variantes existentes de los componentes. Sin colores hardcodeados dispersos.
2. **Feedback sonoro** generado por síntesis (Web Audio API) en un servicio reutilizable, disparado solo en acciones importantes, con preferencia de silencio persistida.

Ambos respetan modo claro/oscuro y no tocan el layout.

## 1. Color

### Tokens (en `src/index.css`)

El preset de shadcn ya define variables para `:root` (claro) y `.dark` (oscuro): `--primary`, `--destructive`, `--muted`, etc. Intervenimos así:

- **Acento primario** (`--primary` / `--primary-foreground`): pasa de neutro a un índigo/violeta suave. Se define en ambos temas con contraste AA. Esto colorea automáticamente los botones `variant="default"` (acciones principales), sin tocar cada botón.
- **Semánticos nuevos** (tokens propios, porque shadcn solo trae `--destructive`):
  - `--success` / `--success-foreground` (verde)
  - `--warning` / `--warning-foreground` (ámbar)
  - `--destructive` ya existe (rojo) — se reutiliza.
- **Acentos de sección** (sutiles): `--accent-cupones`, `--accent-sorteos` como tintes para íconos/headers de esas secciones.

Todos se declaran en `:root` y en `.dark` con valores calibrados para cada tema.

### Exposición a Tailwind v4

Tailwind v4 lee los tokens vía `@theme inline` (ya presente por shadcn). Se agregan los nuevos colores (`success`, `warning`, acentos) al mapa de `@theme` para poder usar `bg-success`, `text-success-foreground`, `bg-warning`, etc.

### Aplicación por componente (sin romper nada)

- **Botones de acción principal**: ya usan `variant="default"` → heredan el nuevo `--primary`. No se tocan uno por uno.
- **Badges de estado**: hoy usan `variant` default/outline. Se crean utilidades/clases con los semánticos:
  - Membresía activa / sorteo activo → verde (`bg-success/...`).
  - Sorteo cerrado / sin membresía → neutro/outline.
  - Cupón vencido → rojo tenue.
- **Historial** (`MovimientoItem`): montos positivos en `text-success`, negativos en `text-destructive` (hoy usa `text-emerald-600`/`text-destructive` hardcodeado → se migra a tokens).
- **Secciones**: íconos de encabezado de Cupones y Sorteos toman su acento de sección.
- **Toasts (sonner)**: ya mapean a tokens de popover; se verifican los colores de success/error para que acompañen.

### Accesibilidad

- El color nunca es el único indicador: se mantiene texto ("Activa", "Vencido") e íconos.
- Contraste objetivo AA para texto sobre acento primario y semánticos, en ambos temas.

## 2. Sonido

### Servicio `src/lib/sound.ts`

Pequeño módulo que sintetiza dos sonidos con Web Audio API (sin assets):
- `playSuccess()`: dos tonos ascendentes cortos y suaves (sensación de confirmación).
- `playError()`: un tono grave y breve (sensación de rechazo).

Detalles:
- Crea/retoma un `AudioContext` perezosamente en el primer uso (respeta la política de autoplay: se inicializa dentro del handler de una interacción).
- Lee la preferencia de silencio; si está silenciado, no hace nada.
- Volumen bajo por defecto; envolvente corta (attack/decay) para que sea sutil.
- Maneja el caso de navegadores sin Web Audio de forma silenciosa (no rompe).

### Preferencia de silencio

- Hook `useSoundPreference` (o helpers en el mismo módulo) con estado persistido en `localStorage` bajo una clave (ej. `cuponet.sound`).
- Default: **activado**.
- Un control en el header (AppShell) con ícono de altavoz / altavoz tachado (lucide `Volume2` / `VolumeOff`) para alternar.

### Puntos de disparo (solo acciones importantes)

En los handlers que ya existen, tras conocer el resultado del servicio:
- `Membresia.comprar` → éxito/error.
- `CuponDetalle.canjear` → éxito/error.
- `SorteoDetalle.inscribir` → éxito/error.
- `AdminCreditos` (cargar créditos) → éxito/error.

Se dispara junto al `toast` existente (mismo punto), de modo que sonido y toast queden sincronizados. No se agrega sonido a navegación, listados ni botones secundarios.

## Estructura de archivos

```
src/
  index.css                 # tokens de color (primary, success, warning, acentos) + @theme
  lib/
    sound.ts                # síntesis de sonidos + preferencia de silencio
  hooks/
    useSoundPreference.ts   # (si se separa) estado persistido de silencio
  components/
    layout/AppShell.tsx     # toggle de sonido en el header
    historial/MovimientoItem.tsx  # montos con tokens semánticos
    ...                     # ajustes puntuales de color donde aplique
  pages/
    Membresia.tsx, CuponDetalle.tsx, SorteoDetalle.tsx  # llamadas a playSuccess/playError
  components/admin/AdminCreditos.tsx                     # idem
```

## Estrategia de verificación

- Visual: recorrer todas las pantallas en **claro y oscuro** confirmando que el color aparece de forma coherente y legible.
- Contraste: revisar acento primario y semánticos (objetivo AA).
- Sonido: confirmar tono distinto en éxito vs. error en las 4 acciones; que no suene en navegación; que el toggle silencia y persiste tras recargar.
- No-regresión: `npm run build` sin errores; layout intacto.
- Nota de alcance: la verificación de color es visual; el cumplimiento WCAG pleno requeriría pruebas con herramientas de contraste y lectores de pantalla (fuera del alcance automático).
