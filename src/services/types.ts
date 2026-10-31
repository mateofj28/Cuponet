// Tipos de dominio de Cuponet (ver .kiro/specs/cuponet-mvp/design.md)

export type Role = "cliente" | "admin"

export type PlanId = "plan1" | "plan3" | "black"

export interface Plan {
  id: PlanId
  nombre: string // "Plan 1", "Plan 3", "Plan Black"
  meses: number // 1, 3, 12
  costoCreditos: number
}

export interface Membership {
  planId: PlanId
  inicio: string // ISO
  expiracion: string // ISO
  // El estado (activa/vencida) se deriva: activa si now < expiracion
}

export interface User {
  id: string
  nombre: string
  apellido: string | null
  dni: string | null
  email: string
  role: Role
  creditos: number
  membresia: Membership | null
}

/**
 * Usuario expuesto a la UI. Con Supabase Auth las credenciales las maneja
 * Auth; el perfil (rol, créditos, membresía) vive en la tabla `profiles`.
 */
export type PublicUser = User

export interface Comercio {
  id: string
  nombre: string
  instagramUrl: string
  descripcion: string
  direccion: string | null
  telefono: string | null
  email: string | null
  activo: boolean
  createdAt: string
}

export interface Cupon {
  id: string
  comercioId: string
  titulo: string
  descripcion: string
  descuento: string // ej. "30% en comida"
  vencimiento: string // ISO
}

export interface Sorteo {
  id: string
  titulo: string
  productoPrincipal: string
  productosSecundarios: string[]
  cierre: string // ISO -> cierre de inscripciones (cuenta regresiva)
  fechaSorteo: string // ISO -> fecha de anuncio del premio (>= cierre)
  numerosEnJuego: number
  costoCreditos: number // costo por inscripción
  estado: "activo" | "cerrado"
}

export interface Inscripcion {
  id: string
  sorteoId: string
  userId: string
  numeros: number[]
}

export type TipoMovimiento =
  | "compra_membresia"
  | "canje_cupon"
  | "inscripcion_sorteo"
  | "carga_creditos"

export interface Movimiento {
  id: string
  userId: string
  tipo: TipoMovimiento
  fecha: string // ISO
  detalle: string
  creditos?: number // + carga / - gasto
}

/** Resultado estándar de las operaciones de los servicios. */
export type ServiceResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string }

// ---- Métricas del panel admin ----

export interface DashboardMetrics {
  totalUsuarios: number
  nuevosHoy: number
  membresiasActivas: number
  cuponesCanjeadosHoy: number
  sorteosActivos: number
  sorteosFinalizados: number
  puntosCargadosHoy: number
}

export interface PuntoCargadoDia {
  dia: string // ISO date
  total: number
}

export interface SorteoStats {
  sorteosTotal: number
  sorteosActivos: number
  sorteosFinalizados: number
  participaciones: number
  usuariosParticipantes: number
  puntosUtilizados: number
}

/** Usuario tal como se muestra en la gestión del admin. */
export interface UsuarioAdmin {
  id: string
  nombre: string
  apellido: string | null
  dni: string | null
  email: string
  role: Role
  creditos: number // saldo actual
  puntosUtilizados: number // total gastado (histórico)
  createdAt: string
  planId: PlanId | null
  membresiaInicio: string | null
  membresiaExpiracion: string | null
}
