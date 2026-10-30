# Plan de implementación — Color y sonido

- [x] 1. Definir tokens de color de tema
  - En `src/index.css`: ajustar `--primary`/`--primary-foreground` a un índigo/violeta suave (claro y oscuro); agregar `--success`, `--warning` (+ foregrounds) y `--accent-cupones`, `--accent-sorteos`.
  - Registrar los nuevos colores en el bloque `@theme` para exponerlos a Tailwind (`bg-success`, `text-warning`, etc.).
  - _Requisitos: RC1, RC2, RC3_

- [x] 2. Migrar colores hardcodeados a tokens
  - `MovimientoItem`: montos +/- usando `text-success` / `text-destructive` (reemplazar `emerald-600`).
  - Revisar otros usos sueltos de color y pasarlos a tokens.
  - _Requisitos: RC2, RC4_

- [x] 3. Aplicar semánticos a badges de estado
  - Membresía activa y sorteo activo → verde (success); cerrado/sin membresía → neutro; cupón vencido → rojo tenue.
  - Pantallas: Home, Membresía, Cupones (+detalle), Sorteos (+detalle), Admin.
  - _Requisitos: RC2, RC4, RC7_

- [x] 4. Acentos sutiles por sección
  - Íconos/encabezados de Cupones y Sorteos con su acento de sección (discreto).
  - _Requisitos: RC3_

- [x] 5. Servicio de sonido (Web Audio API)
  - `src/lib/sound.ts`: `playSuccess()` y `playError()` sintetizados; AudioContext perezoso; volumen bajo; degradación silenciosa si no hay soporte.
  - _Requisitos: RC5_

- [x] 6. Preferencia de silencio
  - Estado persistido en localStorage (default activado); helper/hook; que `play*` respete el silencio.
  - Toggle en el header del AppShell (Volume2 / VolumeOff).
  - _Requisitos: RC6_

- [x] 7. Disparar sonido en acciones importantes
  - En los handlers existentes (junto al toast): comprar membresía, canjear cupón, inscribirse a sorteo, cargar créditos → `playSuccess`/`playError` según resultado.
  - Verificar que NO suene en navegación ni botones secundarios.
  - _Requisitos: RC5_

- [x] 8. Verificación
  - Recorrer todas las pantallas en claro y oscuro (coherencia y legibilidad).
  - Probar sonidos (éxito vs error en las 4 acciones), toggle de silencio y persistencia.
  - `npm run build` sin errores; layout intacto.
  - _Requisitos: RC1–RC7_
```
