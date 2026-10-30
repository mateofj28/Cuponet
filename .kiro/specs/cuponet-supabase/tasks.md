# Plan de implementación — Cuponet con Supabase

- [x] 1. Configuración del cliente y entorno
  - Instalar `@supabase/supabase-js`.
  - Crear `src/lib/supabase.ts` (instancia única, fail-fast si faltan envs).
  - Crear `.env.example` y agregar `.env` al `.gitignore` (verificar que ya esté).
  - Crear `.env` local con los valores reales (no se commitea).
  - _Requisitos: RS1_

- [x] 2. Migración de esquema (`0001_schema.sql`)
  - Enums, tablas (profiles, planes, memberships, comercios, cupones, canjes, sorteos, inscripciones, movimientos), PKs, FKs, checks (créditos >= 0), índices y únicos.
  - _Requisitos: RS2_

- [x] 3. Migración de RLS (`0002_rls.sql`)
  - Habilitar RLS en todas las tablas; función `is_admin()`; políticas de lectura/escritura por tabla según diseño.
  - _Requisitos: RS4_

- [x] 4. Migración de funciones y trigger (`0003_functions.sql`)
  - Trigger `handle_new_user` (crea perfil cliente al registrarse).
  - RPCs `comprar_membresia`, `inscribir_sorteo`, `canjear_cupon`, `cargar_creditos` (atómicas, security definer).
  - _Requisitos: RS5_

- [x] 5. Seed de datos (`seed.sql`)
  - Planes (plan1/plan3/black), comercios, cupones (incluir uno vencido), sorteos (uno próximo a cerrar).
  - _Requisitos: RS2_

- [x] 6. Aplicar migraciones y seed al proyecto Supabase
  - Ejecutar el SQL contra el proyecto; verificar tablas, RLS activo y funciones creadas.
  - _Requisitos: RS2, RS4, RS5_

- [x] 7. Mappers y utilidades
  - `src/services/mappers.ts` (fila snake_case -> tipo camelCase, puros y reutilizables).
  - `src/services/result.ts` (helpers ok/fail + traducción de errores).
  - `src/hooks/useAsync.ts` (estado loading/error reutilizable para páginas).
  - _Requisitos: RS6, RS7_

- [x] 8. Auth contra Supabase
  - [x] 8.1 Reimplementar `authService` (register/login/logout/getCurrentUser/onAuthChange + listados admin).
    - _Requisitos: RS3, RS6_
  - [x] 8.2 Adaptar `AuthContext` a sesión async (loading, onAuthStateChange, refreshUser).
    - _Requisitos: RS3, RS7_
  - [x] 8.3 Ajustar rutas protegidas para el estado `loading` (spinner en vez de redirigir).
    - _Requisitos: RS3, RS7_

- [x] 9. Migrar servicios de dominio
  - [x] 9.1 `creditService` (getSaldo + rpc cargar_creditos).
    - _Requisitos: RS5, RS6_
  - [x] 9.2 `membershipService` (getPlanes, rpc comprar_membresia, esMembresiaActiva).
    - _Requisitos: RS5, RS6_
  - [x] 9.3 `couponService` (listados + rpc canjear_cupon + CRUD admin).
    - _Requisitos: RS5, RS6_
  - [x] 9.4 `raffleService` (listados + getInscripcion + rpc inscribir_sorteo + CRUD/cerrar admin).
    - _Requisitos: RS5, RS6_
  - [x] 9.5 `historyService` (listarPorUsuario, listarGlobal).
    - _Requisitos: RS6_

- [x] 10. Adaptar páginas a estados asíncronos
  - Login/Registro, Home, Membresía, Cupones (+detalle), Sorteos (+detalle), Historial, Admin (tabs): carga con loading/error, acciones con await + toast, refresco de perfil tras operaciones.
  - _Requisitos: RS6, RS7, RS8_

- [x] 11. Eliminar el mock
  - Borrar `store.ts`, `mockData.ts`, `movimientos.ts` y referencias; limpiar `index.ts`.
  - _Requisitos: RS6_

- [x] 12. Verificación end-to-end y seguridad
  - Probar RLS (un cliente no ve datos de otro; no-admin no crea cupones; usuario no se auto-carga créditos).
  - Probar RPCs (saldo insuficiente sin efectos; inscripción descuenta y respeta cupo; carga solo admin).
  - Persistencia de sesión al recargar. `npm run build` sin errores. Flujo completo cliente + admin.
  - _Requisitos: RS1–RS8_
```
