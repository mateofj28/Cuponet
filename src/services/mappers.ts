// Conversión de filas de Supabase (snake_case) a los tipos del frontend
// (camelCase). Funciones puras y reutilizables; sin lógica de negocio.

import type {
  Comercio,
  Cupon,
  Inscripcion,
  Movimiento,
  Plan,
  PlanId,
  PublicUser,
  Role,
  Sorteo,
  TipoMovimiento,
} from "./types"

// ---- Formas crudas de las filas tal como llegan de la base ----

export interface ProfileRow {
  id: string
  nombre: string
  role: Role
  creditos: number
}

export interface MembershipRow {
  plan_id: PlanId
  inicio: string
  expiracion: string
}

export interface PlanRow {
  id: PlanId
  nombre: string
  meses: number
  costo_creditos: number
}

export interface ComercioRow {
  id: string
  nombre: string
  instagram_url: string | null
}

export interface CuponRow {
  id: string
  comercio_id: string
  titulo: string
  descripcion: string
  descuento: string
  vencimiento: string
}

export interface SorteoRow {
  id: string
  titulo: string
  producto_principal: string
  productos_secundarios: string[]
  cierre: string
  numeros_en_juego: number
  costo_creditos: number
  estado: "activo" | "cerrado"
}

export interface InscripcionRow {
  id: string
  sorteo_id: string
  user_id: string
  numeros: number[]
}

export interface MovimientoRow {
  id: string
  user_id: string
  tipo: TipoMovimiento
  fecha: string
  detalle: string
  creditos: number | null
}

// ---- Mappers ----

export const mapPlan = (r: PlanRow): Plan => ({
  id: r.id,
  nombre: r.nombre,
  meses: r.meses,
  costoCreditos: r.costo_creditos,
})

export const mapComercio = (r: ComercioRow): Comercio => ({
  id: r.id,
  nombre: r.nombre,
  instagramUrl: r.instagram_url ?? "",
})

export const mapCupon = (r: CuponRow): Cupon => ({
  id: r.id,
  comercioId: r.comercio_id,
  titulo: r.titulo,
  descripcion: r.descripcion,
  descuento: r.descuento,
  vencimiento: r.vencimiento,
})

export const mapSorteo = (r: SorteoRow): Sorteo => ({
  id: r.id,
  titulo: r.titulo,
  productoPrincipal: r.producto_principal,
  productosSecundarios: r.productos_secundarios ?? [],
  cierre: r.cierre,
  numerosEnJuego: r.numeros_en_juego,
  costoCreditos: r.costo_creditos,
  estado: r.estado,
})

export const mapInscripcion = (r: InscripcionRow): Inscripcion => ({
  id: r.id,
  sorteoId: r.sorteo_id,
  userId: r.user_id,
  numeros: r.numeros ?? [],
})

export const mapMovimiento = (r: MovimientoRow): Movimiento => ({
  id: r.id,
  userId: r.user_id,
  tipo: r.tipo,
  fecha: r.fecha,
  detalle: r.detalle,
  creditos: r.creditos ?? undefined,
})

/**
 * Arma el PublicUser combinando la fila de perfil, el email de Auth y la
 * membresía vigente (la de mayor expiración, o null).
 */
export const mapUser = (
  profile: ProfileRow,
  email: string,
  membership: MembershipRow | null
): PublicUser => ({
  id: profile.id,
  nombre: profile.nombre,
  email,
  role: profile.role,
  creditos: profile.creditos,
  membresia: membership
    ? {
        planId: membership.plan_id,
        inicio: membership.inicio,
        expiracion: membership.expiracion,
      }
    : null,
})
