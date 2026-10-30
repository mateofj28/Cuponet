# Requisitos — Cuponet con Supabase

## Introducción

Migrar Cuponet de la capa mock en memoria a un backend real con **Supabase** (Postgres + Auth + RLS), conservando el comportamiento funcional del MVP (requisitos R1–R8 del spec `cuponet-mvp`) pero con persistencia real, sesión que sobrevive a recargas, roles seguros y reglas de negocio aplicadas en la base de datos.

El objetivo es que la **UI no cambie** (misma experiencia), reemplazando solo la implementación de la capa de servicios. La seguridad deja de ser un `if` en el frontend y pasa a RLS + funciones de Postgres.

## Principios (del steering `supabase`)

- RLS obligatorio en todas las tablas con datos de usuario.
- Operaciones sensibles vía funciones `security definer` (atómicas, no manipulables desde el cliente).
- Claves en variables de entorno, nunca en el repo.
- El contrato `ServiceResult<T>` se mantiene para no romper la UI.

---

## Requisitos

### RS1 — Configuración del cliente Supabase

**Historia:** Como desarrollador, quiero inicializar el cliente de Supabase desde variables de entorno, para conectar la app de forma segura y configurable.

#### Criterios de aceptación
1. EL sistema DEBERÁ leer `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` desde el entorno.
2. SI falta alguna variable de entorno requerida, EL sistema DEBERÁ fallar con un error claro al iniciar (no silenciosamente).
3. EL repositorio DEBERÁ incluir `.env.example` con los nombres de variables y NO incluir `.env` con valores reales.
4. EL cliente de Supabase DEBERÁ exponerse como una única instancia reutilizable.

### RS2 — Esquema de base de datos

**Historia:** Como equipo, quiero un esquema Postgres versionado que represente el dominio, para persistir datos de forma consistente.

#### Criterios de aceptación
1. EL esquema DEBERÁ incluir tablas para: perfiles de usuario, planes, membresías, comercios, cupones, canjes, sorteos, inscripciones (con números) y movimientos.
2. CADA tabla DEBERÁ tener claves primarias, claves foráneas y restricciones (not null, checks) acordes al dominio.
3. EL esquema DEBERÁ gestionarse mediante migraciones SQL versionadas en `supabase/migrations/`.
4. LOS planes semilla (Plan 1, Plan 3, Black) y comercios/cupones/sorteos de ejemplo DEBERÁN cargarse vía seed.
5. EL saldo de créditos NUNCA DEBERÁ poder quedar negativo (restricción en la base).

### RS3 — Autenticación real

**Historia:** Como usuario, quiero registrarme e iniciar sesión con credenciales reales, para que mi sesión persista entre recargas.

#### Criterios de aceptación
1. CUANDO un visitante se registra, EL sistema DEBERÁ crear un usuario en Supabase Auth y un perfil asociado con rol "cliente" y 0 créditos.
2. CUANDO un usuario inicia sesión con credenciales válidas, EL sistema DEBERÁ establecer una sesión persistente.
3. CUANDO el usuario recarga la página, EL sistema DEBERÁ restaurar la sesión automáticamente si sigue vigente.
4. CUANDO un usuario cierra sesión, EL sistema DEBERÁ limpiar la sesión.
5. SI las credenciales son inválidas, EL sistema DEBERÁ mostrar un mensaje de error claro en español.
6. EL perfil del usuario (nombre, rol, créditos, membresía) DEBERÁ poder leerse tras autenticarse.

### RS4 — Roles y seguridad (RLS)

**Historia:** Como dueño del producto, quiero que las reglas de acceso vivan en la base, para que no se puedan evadir desde el frontend.

#### Criterios de aceptación
1. TODAS las tablas con datos de usuario DEBERÁN tener RLS habilitado.
2. UN usuario DEBERÁ poder leer solo su propio perfil, sus movimientos y sus inscripciones.
3. CUALQUIER usuario autenticado DEBERÁ poder leer cupones, comercios, sorteos y planes (catálogo público para miembros).
4. SOLO un usuario con rol admin DEBERÁ poder crear/editar/eliminar cupones y sorteos, y cargar créditos.
5. UN usuario NO DEBERÁ poder modificar su propio saldo de créditos ni su rol directamente.
6. EL rol DEBERÁ determinarse desde la base (tabla de perfiles), nunca desde datos enviados por el cliente.

### RS5 — Operaciones transaccionales (RPC)

**Historia:** Como dueño del producto, quiero que las operaciones que mueven créditos sean atómicas y seguras, para evitar inconsistencias y fraudes.

#### Criterios de aceptación
1. "Comprar membresía" DEBERÁ ser una función que, de forma atómica: valide saldo, descuente créditos, cree/actualice la membresía y registre el movimiento. SI el saldo es insuficiente, DEBERÁ fallar sin efectos.
2. "Inscribirse a sorteo" DEBERÁ ser una función que, de forma atómica: valide membresía activa, sorteo activo, disponibilidad de números y saldo; descuente créditos; asigne número y registre el movimiento.
3. "Canjear cupón" DEBERÁ validar membresía activa y vigencia del cupón, y registrar el canje (sin descontar créditos).
4. "Cargar créditos" DEBERÁ validar que quien ejecuta es admin, sumar el saldo al usuario destino y registrar el movimiento.
5. CADA función DEBERÁ devolver un resultado interpretable por la capa de servicios para traducir a `ServiceResult`.

### RS6 — Migración de la capa de servicios

**Historia:** Como desarrollador, quiero reemplazar el mock por Supabase sin tocar la UI, para preservar la experiencia y minimizar riesgo.

#### Criterios de aceptación
1. CADA servicio (`auth`, `credit`, `membership`, `coupon`, `raffle`, `history`) DEBERÁ reimplementarse contra Supabase manteniendo su firma pública y el contrato `ServiceResult<T>`.
2. LOS componentes de UI NO DEBERÁN llamar al cliente de Supabase directamente.
3. LAS pantallas existentes DEBERÁN seguir funcionando con cambios mínimos (idealmente solo volver asíncronas las llamadas).
4. EL store mock en memoria y los datos semilla mock DEBERÁN eliminarse una vez migrado.

### RS7 — Estados asíncronos en la UI

**Historia:** Como usuario, quiero ver estados de carga y errores claros, para entender qué pasa cuando la app consulta el servidor.

#### Criterios de aceptación
1. LAS pantallas que cargan datos DEBERÁN mostrar un estado de carga mientras se resuelve la consulta.
2. SI una operación falla, EL sistema DEBERÁ mostrar un mensaje claro (toast o inline) sin exponer errores crudos del backend.
3. TRAS una operación que cambia saldo o membresía, LA UI DEBERÁ reflejar el nuevo estado (refresco del perfil).

### RS8 — Paridad funcional con el MVP

**Historia:** Como dueño del producto, quiero que todo lo que hacía el MVP siga funcionando, para no perder funcionalidad al migrar.

#### Criterios de aceptación
1. TODOS los flujos del spec `cuponet-mvp` (R1–R8) DEBERÁN funcionar con Supabase: auth, membresías, cupones, sorteos, créditos, historial y panel admin.
2. EL comportamiento observable para el usuario DEBERÁ ser equivalente al MVP, salvo las mejoras (persistencia real, sesión).

---

## Fuera de alcance

- Pasarela de pago real para comprar créditos (sigue siendo el admin quien carga).
- Lógica de ejecución del sorteo / selección de ganador.
- Notificaciones push / email transaccional (más allá de lo que trae Supabase Auth).
- Realtime (suscripciones en vivo); se evaluará después si hace falta.

## Decisiones confirmadas

- Proyecto Supabase: **vacío**, empezamos el esquema desde cero.
- Equipo: una persona + asistente; aun así se usan **migraciones versionadas**.
- Auth: email/password (igual que el MVP).
- Créditos: los carga el admin; la membresía y los sorteos se pagan con créditos; los cupones son gratis con membresía activa.
