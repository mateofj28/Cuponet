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
  email: string
  password: string // mock: en texto plano, solo para el MVP en memoria
  role: Role
  creditos: number
  membresia: Membership | null
}

/** Usuario expuesto a la UI, sin campos sensibles. */
export type PublicUser = Omit<User, "password">

export interface Comercio {
  id: string
  nombre: string
  instagramUrl: string
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
  cierre: string // ISO -> cuenta regresiva
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
