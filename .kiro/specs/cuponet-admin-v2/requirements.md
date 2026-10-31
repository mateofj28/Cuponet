# Requisitos — Panel de administración v2

## Introducción

Rediseño y ampliación del panel de administración de Cuponet. Se reemplazan tres secciones actuales (hoy el panel tiene tabs: Créditos, Cupones, Sorteos, Historial) por módulos más ricos, se agrega un módulo de Comercios, se mejoran interacciones (confirmaciones, buscador), y se amplía el modelo de datos (usuarios con apellido/DNI, comercios con más campos, sorteos con fecha de anuncio).

Todo sobre la base existente (React + Vite + shadcn/ui + Supabase con RLS). Se reutilizan componentes, servicios y convenciones actuales.

## Convenciones (de steering)

- **"Puntos"** en toda la UI (requisito legal); internamente sigue siendo `creditos`. No se renombra la base ni el código.
- **Ingresos**: el sistema no maneja dinero real; las métricas hablan de "puntos cargados", no de "$".
- **Referidos**: fuera de alcance (ver roadmap). Se deja previsto el espacio en la gestión de usuarios pero sin datos hasta que exista el sistema.

## Estructura nueva del panel admin

Secciones (reemplazan/amplían las actuales):
1. **Dashboard** (reemplaza el "inicio" del admin) — resumen de actividad.
2. **Usuarios** (reemplaza la tab Cupones del admin) — gestión y búsqueda de usuarios.
3. **Estadísticas de sorteos** (reemplaza la tab Sorteos como vista de métricas) — ver nota.
4. **Comercios** (nuevo) — CRUD.
5. **Créditos** (se mantiene, con buscador mejorado).
6. **Historial** (se mantiene, con filtros).
7. La administración CRUD de **cupones** y **sorteos** se conserva (no se pierde la capacidad de crear/editar cupones y sorteos; ver nota de diseño sobre dónde viven).

> Nota: el enunciado dice "reemplazar cupones por usuarios" y "reemplazar sorteos por estadísticas". Para no perder el ABM de cupones y sorteos (que sigue siendo necesario), en diseño se define cómo reubicarlos (p. ej. Comercios/Cupones/Sorteos como gestión, más Dashboard/Usuarios/Estadísticas/Historial como vistas). Se confirma con el usuario en diseño.

---

## Requisitos

### RA1 — Ampliar modelo de usuarios (apellido, DNI)

**Historia:** Como admin, quiero que los usuarios tengan apellido y DNI, para identificarlos y gestionarlos.

#### Criterios de aceptación
1. EL perfil DEBERÁ incluir `apellido` y `dni`.
2. EL formulario de registro DEBERÁ pedir apellido y DNI (con validación de formato de DNI).
3. EL DNI DEBERÁ ser único entre usuarios.
4. LOS usuarios existentes sin estos datos DEBERÁN seguir funcionando (campos opcionales a nivel de datos, validados en el registro nuevo).

### RA2 — Dashboard administrativo

**Historia:** Como admin, quiero un panel de resumen, para conocer el estado de la plataforma de un vistazo.

#### Criterios de aceptación
1. EL dashboard DEBERÁ mostrar en tarjetas: total de usuarios, nuevos usuarios del día, membresías activas, cupones canjeados en el día, sorteos activos y finalizados, puntos cargados en el día.
2. LAS métricas DEBERÁN calcularse con datos reales de la base (no valores ficticios).
3. DONDE aporte, DEBERÁ incluir un gráfico simple (ej. puntos cargados por día en la última semana).
4. EL dashboard DEBERÁ manejar estados de carga y vacío.
5. SI una métrica no tiene datos, DEBERÁ mostrar 0 o "sin datos", no un valor inventado.

### RA3 — Gestión de usuarios

**Historia:** Como admin, quiero ver y buscar todos los usuarios, para administrarlos.

#### Criterios de aceptación
1. EL módulo DEBERÁ listar usuarios con: email, nombre, apellido, DNI, rol, plan contratado, fecha de registro, inicio de plan, vencimiento de plan, puntos utilizados.
2. LAS columnas de referidos (cantidad, ganancias) DEBERÁN mostrarse como "—" / pendientes (sin datos, hasta que exista el sistema de referidos).
3. EL módulo DEBERÁ permitir filtrar/buscar por: nombre y apellido, email, DNI, rol, plan, estado de membresía (activa/vencida), fecha de registro.
4. LA lista DEBERÁ manejar carga, vacío y (si hay muchos) paginación o scroll.
5. SOLO el admin DEBERÁ poder acceder (RLS ya lo garantiza para lectura de todos los perfiles).

### RA4 — Estadísticas de sorteos

**Historia:** Como admin, quiero métricas de sorteos, para entender la participación.

#### Criterios de aceptación
1. EL módulo DEBERÁ mostrar: sorteos realizados (total), activos, finalizados, participaciones registradas, usuarios participantes (distintos), puntos utilizados en sorteos.
2. DEBERÁ permitir filtrar por rango de fechas y estado del sorteo.
3. LAS cifras DEBERÁN salir de datos reales (inscripciones, sorteos, movimientos).
4. DEBERÁ manejar estados de carga y vacío.

### RA5 — Buscador de clientes en carga de puntos

**Historia:** Como admin, quiero buscar al cliente escribiendo, para no recorrer una lista larga.

#### Criterios de aceptación
1. EL selector actual DEBERÁ reemplazarse por un buscador de texto.
2. LA búsqueda DEBERÁ aceptar email o DNI y mostrar coincidencias dinámicamente mientras se escribe.
3. AL elegir un resultado, DEBERÁ quedar seleccionado como destino de la carga.
4. SI no hay coincidencias, DEBERÁ indicarlo.

### RA6 — Confirmación al eliminar cupón

**Historia:** Como admin, quiero confirmar antes de borrar un cupón, para evitar borrados accidentales.

#### Criterios de aceptación
1. AL eliminar, DEBERÁ abrirse un modal de confirmación (informa, opciones Cancelar / Eliminar).
2. EL cupón DEBERÁ eliminarse solo al confirmar.
3. SI cancela, el cupón NO DEBERÁ modificarse.

### RA7 — Módulo de comercios (CRUD)

**Historia:** Como admin, quiero administrar comercios, para gestionar los asociados.

#### Criterios de aceptación
1. EL comercio DEBERÁ ampliarse con: descripción, dirección, teléfono, email, estado (activo/inactivo), fecha de registro (además del nombre e instagram existentes).
2. EL módulo DEBERÁ permitir: crear, listar, editar, activar/desactivar y eliminar (con confirmación).
3. LA estructura DEBERÁ quedar preparada para agregar campos a futuro.
4. DEBERÁ manejar carga, vacío y errores.

### RA8 — Confirmación al cerrar sorteo

**Historia:** Como admin, quiero confirmar antes de cerrar un sorteo, para no cerrarlo por error.

#### Criterios de aceptación
1. AL cerrar, DEBERÁ abrirse un modal de confirmación (Cancelar / Confirmar cierre).
2. EL sorteo DEBERÁ cerrarse solo al confirmar.
3. SI cancela, DEBERÁ permanecer en su estado actual.

### RA9 — Fecha de anuncio del sorteo

**Historia:** Como admin, quiero definir cuándo se anuncia el premio, además de cuándo cierran las inscripciones.

#### Criterios de aceptación
1. EL sorteo DEBERÁ tener dos fechas: `cierre` (fin de inscripciones, ya existe) y `fecha_sorteo` (anuncio del premio, nueva).
2. EL formulario de creación/edición DEBERÁ incluir `fecha_sorteo` con selector de fecha, obligatoria.
3. `fecha_sorteo` DEBERÁ ser igual o posterior a `cierre` (regla de negocio).
4. LA fecha DEBERÁ mostrarse en el listado y detalle del sorteo.

### RA10 — Filtros en historial global

**Historia:** Como admin, quiero filtrar el historial por tipo de movimiento, para analizarlo.

#### Criterios de aceptación
1. EL historial global DEBERÁ poder filtrarse por tipo: cargas de puntos, inscripciones a sorteos (y "todos" por defecto).
2. SIN filtro, DEBERÁ mostrar todos los movimientos (comportamiento actual).
3. EL listado DEBERÁ reflejar el filtro seleccionado, con estado vacío si no hay resultados.

---

## No funcionales (instrucciones generales)

1. Reutilizar componentes/servicios existentes; mantener arquitectura y convenciones.
2. No modificar funcionalidades ajenas a estos requerimientos.
3. Filtros y búsquedas sobre datos reales.
4. Coherencia visual con el diseño actual (índigo + semánticos + shadcn).
5. Estados de carga, error y vacío donde corresponda.
6. Sin datos ficticios cuando hay datos reales.
7. `npm run build` sin errores; no romper otros módulos.

## Fuera de alcance

- Sistema de referidos (roadmap).
- Registro de montos en dinero / ingresos en $.
- Reportes exportables (CSV/PDF), salvo que se pida luego.

## Decisiones confirmadas

- Apellido y DNI se agregan a usuarios (DNI único).
- "Puntos" solo en UI; interno `creditos`.
- Dashboard: "puntos cargados", sin $.
- Comercios con todos los campos nuevos.
- Sorteo con dos fechas (cierre + fecha_sorteo).
- Referidos: previstos como columnas vacías, implementación pospuesta.
