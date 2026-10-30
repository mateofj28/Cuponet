# Requisitos — Color y sonido en la UI

## Introducción

La app hoy es casi monocromática (blanco y negro). Este trabajo introduce **color funcional** (no de marca) para que la interfaz comunique estados y jerarquía, y agrega **feedback sonoro** en las acciones importantes, con sonidos distintos para éxito y error. Todo debe funcionar en modo claro y oscuro, construido sobre shadcn/ui + Tailwind (ver steering `ui-components`).

## Alcance y aclaraciones

- **No se define identidad de marca**: no se inventa un logo ni un "color corporativo". El color se usa de forma funcional (acciones, estados, acentos).
- El acento primario y los colores semánticos se definen vía las **variables de tema de shadcn** (tokens CSS), no con colores hardcodeados en componentes.
- El sonido es sutil, opcional de silenciar, y solo en acciones significativas.

---

## Requisitos

### RC1 — Acento primario funcional

**Historia:** Como usuario, quiero que las acciones principales resalten con color, para identificarlas de un vistazo.

#### Criterios de aceptación
1. EL sistema DEBERÁ definir un color de acento primario (no neutro) aplicado a los botones de acción principal (ej. "Anotarme", "Comprar", "Cargar").
2. EL acento DEBERÁ definirse como token de tema (CSS variables de shadcn) y funcionar en modo claro y oscuro.
3. EL contraste texto/fondo del acento DEBERÁ cumplir una relación legible (objetivo WCAG AA para texto normal).

### RC2 — Colores semánticos

**Historia:** Como usuario, quiero que los estados tengan color, para entender rápido qué significa cada cosa.

#### Criterios de aceptación
1. EL sistema DEBERÁ usar **verde** para éxito y estados positivos (membresía activa, créditos sumados).
2. EL sistema DEBERÁ usar **rojo** para errores y gastos (créditos descontados, cupón vencido, destructivo).
3. EL sistema DEBERÁ usar **ámbar** para advertencias (por vencer, saldo bajo).
4. ESTOS colores DEBERÁN ser tokens reutilizables, no valores sueltos repetidos por componente.

### RC3 — Acentos por sección (sutiles)

**Historia:** Como usuario, quiero distinguir visualmente las secciones, para orientarme en la app.

#### Criterios de aceptación
1. CUPONES y SORTEOS DEBERÁN tener un tinte de acento sutil que los diferencie (ej. en íconos/headers), sin romper la coherencia general.
2. LOS acentos DEBERÁN ser discretos (no saturar la interfaz).

### RC4 — Aplicación consistente en pantallas

**Historia:** Como usuario, quiero que el color aparezca de forma coherente en toda la app, no solo en una pantalla.

#### Criterios de aceptación
1. EL color DEBERÁ aplicarse de forma consistente en: Home, Membresía, Cupones (+detalle), Sorteos (+detalle), Historial, Panel Admin, Login/Registro.
2. LOS badges de estado (membresía activa/inactiva, sorteo activo/cerrado, saldo) DEBERÁN usar los colores semánticos.
3. EL historial DEBERÁ mostrar montos en verde (positivos) y rojo (negativos), de forma legible en ambos temas.

### RC5 — Feedback sonoro en acciones importantes

**Historia:** Como usuario, quiero una señal sonora al confirmar una acción importante, para tener feedback inmediato.

#### Criterios de aceptación
1. EL sistema DEBERÁ reproducir un sonido en estas acciones: comprar membresía, canjear cupón, inscribirse a sorteo, cargar créditos (admin).
2. EL sonido DEBERÁ ser **distinto para éxito y para error** (tono agradable vs. tono seco/grave).
3. EL sistema NO DEBERÁ reproducir sonido en navegación ni en botones secundarios/comunes.
4. EL sonido DEBERÁ generarse sin archivos de audio pesados (síntesis con Web Audio API) para no afectar el tamaño del bundle.
5. EL primer sonido DEBERÁ dispararse recién tras una interacción del usuario (requisito de los navegadores para reproducir audio).

### RC6 — Preferencia de silencio

**Historia:** Como usuario, quiero poder silenciar los sonidos, para usar la app sin audio si molesta o estoy en público.

#### Criterios de aceptación
1. EL sistema DEBERÁ ofrecer un control para activar/silenciar los sonidos.
2. LA preferencia DEBERÁ persistir entre sesiones (localStorage).
3. SI el usuario silenció el sonido, NINGUNA acción DEBERÁ reproducir audio.

### RC7 — Accesibilidad y no-regresión

#### Criterios de aceptación
1. EL color NO DEBERÁ ser el único medio para transmitir información (se mantienen textos/íconos; ej. "Activa" junto al color).
2. EL cambio NO DEBERÁ romper el layout ni el funcionamiento existente; `npm run build` sin errores.
3. SE DEBERÁN respetar los modos claro y oscuro ya soportados.

---

## Fuera de alcance

- Rediseño de layout o de la estructura de navegación.
- Identidad de marca (logo, naming, paleta corporativa).
- Animaciones complejas o librerías de sonido externas.
- Temas personalizables por el usuario (más allá del claro/oscuro existente).

## Decisiones confirmadas

- Acento primario funcional: índigo/violeta suave como punto de partida (ajustable), sin ser "color de marca".
- Semánticos: verde / rojo / ámbar.
- Sonido: solo acciones importantes; distinto para éxito vs. error; con opción de silenciar.
