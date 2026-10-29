# Requisitos — Cuponet MVP

## Introducción

Cuponet es una aplicación web responsive de cupones de descuento y sorteos vinculados a comercios, con acceso por membresía paga. Este documento define los requisitos del MVP cubriendo los dos roles del sistema (Usuario/Cliente y Administrador) y las áreas funcionales: membresías, cupones, sorteos, créditos, historial y panel administrador.

El MVP prioriza el flujo del usuario (acceder por membresía, canjear cupones, participar en sorteos) y las capacidades mínimas del administrador para operar la plataforma.

## Glosario

- **Membresía**: plan pago que habilita el acceso. Estados: activa, vencida.
- **Cupón**: beneficio de un comercio con descuento, vencimiento y enlace a Instagram.
- **Sorteo**: evento con productos en juego, cuenta regresiva y números asignados.
- **Crédito**: saldo del usuario usado para participar en sorteos.
- **Movimiento**: registro de una transacción en el historial.

---

## Requisitos

### R1 — Autenticación y acceso

**Historia de usuario:** Como usuario, quiero registrarme e iniciar sesión, para acceder a mi cuenta y a los beneficios de la plataforma.

#### Criterios de aceptación
1. CUANDO un visitante se registra con datos válidos, EL sistema DEBERÁ crear una cuenta de usuario con rol "cliente" por defecto.
2. CUANDO un usuario inicia sesión con credenciales válidas, EL sistema DEBERÁ autenticarlo y dar acceso según su rol.
3. SI las credenciales son inválidas, EL sistema DEBERÁ rechazar el acceso y mostrar un mensaje de error.
4. CUANDO un usuario no autenticado intenta acceder a una ruta protegida, EL sistema DEBERÁ redirigirlo al inicio de sesión.

### R2 — Membresías

**Historia de usuario:** Como usuario, quiero comprar y gestionar mi membresía (Plan 1, Plan 3 o Black) pagándola con mis créditos, para acceder a cupones y sorteos.

#### Criterios de aceptación
1. CUANDO un usuario autenticado ve los planes, EL sistema DEBERÁ mostrar Plan 1 (1 mes), Plan 3 (3 meses) y Plan Black (1 año) con su costo en créditos y duración.
2. CUANDO un usuario compra un plan Y tiene créditos suficientes, EL sistema DEBERÁ descontar el costo de su saldo, activar su membresía y registrar la fecha de expiración según la duración del plan.
3. SI el usuario no tiene créditos suficientes para el plan, EL sistema DEBERÁ impedir la compra e indicar cuántos créditos faltan.
4. CUANDO la fecha actual supera la fecha de expiración, EL sistema DEBERÁ marcar la membresía como vencida.
5. SI la membresía del usuario está vencida o no existe, EL sistema DEBERÁ bloquear el acceso a cupones y sorteos e invitar a comprar/renovar.
6. CUANDO un usuario con membresía activa ingresa, EL sistema DEBERÁ mostrar el estado y la fecha de vencimiento de su membresía.
7. CUANDO se compra una membresía, EL sistema DEBERÁ registrar el movimiento en el historial.

### R3 — Cupones (Usuario)

**Historia de usuario:** Como usuario con membresía activa, quiero explorar y canjear cupones sin costo, para aprovechar los descuentos de los comercios como beneficio de mi membresía.

> Nota de modelo: canjear cupones es **gratis** mientras la membresía esté activa. Los créditos NO se usan para cupones; solo para membresía y sorteos.

#### Criterios de aceptación
1. CUANDO un usuario con membresía activa abre la sección de cupones, EL sistema DEBERÁ listar los cupones vigentes de los comercios asociados.
2. CUANDO un usuario abre el detalle de un cupón, EL sistema DEBERÁ mostrar la promoción, el descuento, la fecha de vencimiento y el enlace al Instagram del comercio.
3. CUANDO un usuario con membresía activa canjea un cupón vigente, EL sistema DEBERÁ registrar el canje (sin descontar créditos) y reflejarlo en su historial.
4. SI un cupón está vencido, EL sistema DEBERÁ impedir el canje e indicar que expiró.
5. CUANDO un usuario pulsa el enlace de Instagram del comercio, EL sistema DEBERÁ abrir el perfil en una pestaña nueva.

### R4 — Sorteos (Usuario)

**Historia de usuario:** Como usuario con membresía activa, quiero participar en sorteos usando mis créditos, para tener oportunidades de ganar productos.

#### Criterios de aceptación
1. CUANDO un usuario abre la sección de sorteos, EL sistema DEBERÁ mostrar los sorteos activos con producto principal, productos secundarios, cuenta regresiva y cantidad de números en juego.
2. CUANDO un usuario se anota en un sorteo, EL sistema DEBERÁ descontar los créditos correspondientes y asignarle uno o más números.
3. SI el usuario no tiene créditos suficientes, EL sistema DEBERÁ impedir la inscripción e indicar el saldo requerido.
4. CUANDO un usuario consulta un sorteo en el que participa, EL sistema DEBERÁ mostrar sus números asignados.
5. CUANDO la cuenta regresiva llega a cero, EL sistema DEBERÁ marcar el sorteo como cerrado e impedir nuevas inscripciones.

### R5 — Créditos

**Historia de usuario:** Como usuario, quiero ver mi saldo de créditos, para saber con cuánto cuento para comprar membresía y participar en sorteos.

> Nota de modelo: los créditos son la moneda interna. **Solo el administrador los carga** (no hay compra directa ni pasarela de pago en el MVP). El usuario los gasta en membresía y sorteos.

#### Criterios de aceptación
1. CUANDO un usuario ingresa, EL sistema DEBERÁ mostrar su saldo de créditos actual.
2. CUANDO se consume o se carga crédito, EL sistema DEBERÁ actualizar el saldo y registrar el movimiento.
3. EL sistema DEBERÁ impedir que el saldo quede negativo.
4. EL usuario NO DEBERÁ poder cargarse créditos a sí mismo; solo el administrador puede hacerlo.

### R6 — Historial

**Historia de usuario:** Como usuario, quiero revisar mi historial de movimientos, para controlar mis transacciones.

#### Criterios de aceptación
1. CUANDO un usuario abre su historial, EL sistema DEBERÁ listar sus movimientos (compra de membresía, canje de cupón, inscripción a sorteo, carga de créditos) ordenados del más reciente al más antiguo.
2. CADA movimiento DEBERÁ mostrar tipo, fecha y detalle relevante (monto, cupón, sorteo, etc.).

### R7 — Panel Administrador

**Historia de usuario:** Como administrador, quiero gestionar créditos, cupones y sorteos, para operar la plataforma.

#### Criterios de aceptación
1. CUANDO un administrador inicia sesión, EL sistema DEBERÁ darle acceso al panel de administración y no a un cliente sin ese rol.
2. CUANDO un administrador carga créditos a un usuario, EL sistema DEBERÁ aumentar el saldo del usuario y registrar el movimiento.
3. EL administrador DEBERÁ poder crear, editar y dar de baja cupones (comercio, promoción, descuento, vencimiento, Instagram).
4. EL administrador DEBERÁ poder crear y editar sorteos (productos, cuenta regresiva, números en juego) y cerrarlos.
5. CUANDO un administrador consulta el historial global, EL sistema DEBERÁ mostrar los movimientos de la plataforma.

### R8 — Responsive / PWA

**Historia de usuario:** Como usuario, quiero usar la app cómodamente desde el móvil, para acceder a los beneficios en cualquier momento.

#### Criterios de aceptación
1. EL sistema DEBERÁ presentar una interfaz responsive optimizada para pantallas móviles.
2. TODA la UI DEBERÁ construirse con shadcn/ui (según steering `ui-components`).
3. (Opcional MVP) EL sistema PODRÁ ser instalable como PWA.

---

## Decisiones tomadas (definen el alcance del MVP)

1. **Persistencia**: todo **mock en memoria** (sin backend ni base de datos; el estado se pierde al recargar). Se diseñará una capa de datos desacoplada para poder enchufar un backend real luego.
2. **Pagos**: NO hay pasarela de pago. La membresía se **paga con créditos** (moneda interna).
3. **Créditos**: **solo el administrador los carga** al usuario. El usuario los gasta en membresía y sorteos.
4. **Sorteos**: los números y el ganador se **definen en el sistema** (lógica interna simple) por ahora.

## Fuera de alcance del MVP (a futuro)

- Integración real con pasarela de pago para comprar créditos.
- Lógica avanzada de ejecución del sorteo (el MVP cubre inscripción, asignación de números y cierre).
- Backend/persistencia reales (Supabase, API propia, etc.).
- Notificaciones push.
