# Cuponet — Visión de Producto

## Qué es

Cuponet es una **aplicación web responsive** (pensada para uso principalmente desde el móvil, instalable como PWA) de **cupones de descuento y sorteos** vinculados a comercios asociados. El acceso a los beneficios es por **membresía paga**.

> Plataforma: **web** (Vite + React). No es una app nativa. Toda la UI se construye con **shadcn/ui** (ver steering `ui-components`).

## Modelo de negocio: Membresías

Los usuarios pagan una membresía para acceder a la plataforma. Planes:

- **Plan 1** — 1 mes
- **Plan 3** — 3 meses
- **Plan Black** — 1 año

El acceso a cupones y sorteos depende de tener una membresía activa.

## Roles

### Usuario / Cliente
- Compra y gestiona su **membresía** (Plan 1, Plan 3, Plan Black).
- Ve el **menú principal** con accesos a cupones, sorteos y publicidad.
- Explora y **canjea cupones**: detalle de la promoción (ej. % de descuento), fecha de vencimiento y enlace al Instagram del comercio.
- Participa en **sorteos**: ve productos principales y secundarios, contador regresivo, sus números asignados y la cantidad de números en juego.
- Usa **créditos/puntos** para anotarse en sorteos y sumar más oportunidades.
- Revisa su **historial** de transacciones y movimientos.

### Administrador
- Gestiona el sistema desde un **panel de control**.
- **Carga créditos** a los usuarios.
- Administra y modifica **cupones** y **productos en sorteo** (posible apoyo en planillas/bases de datos conectadas).
- Controla el flujo de **sorteos**, sus tiempos y el **historial** global de actividad.

## Conceptos de dominio

- **Membresía**: plan pago (1 mes / 3 meses / Black) que habilita el acceso. Tiene estado (activa/vencida) y fecha de expiración.
- **Cupón**: beneficio de un comercio. Incluye descripción de la promoción, descuento, fecha de vencimiento, enlace a Instagram del comercio y acción de canje.
- **Comercio**: negocio asociado que ofrece cupones. Tiene nombre, redes (Instagram) y cupones vinculados.
- **Sorteo**: incluye producto(s) principal(es) y secundario(s), contador regresivo, números en juego y números asignados a cada participante.
- **Crédito / Punto**: saldo del usuario que se usa para participar en sorteos o sumar oportunidades. El admin los carga.
- **Movimiento / Historial**: registro de transacciones (compra de membresía, canje de cupón, inscripción a sorteo, carga de créditos, etc.).

## Áreas funcionales (alto nivel)

1. **Membresías** — compra y gestión de plan; control de acceso.
2. **Cupones** — listado, detalle y canje.
3. **Sorteos** — participación con créditos, números, cuenta regresiva.
4. **Créditos** — saldo y consumo.
5. **Historial** — movimientos del usuario.
6. **Panel Admin** — carga de créditos, administración de cupones y sorteos, historial global.

> El detalle de requisitos, diseño y tareas de cada área vive en los **Specs** del proyecto, no en este steering. Este archivo es solo contexto permanente de producto.
