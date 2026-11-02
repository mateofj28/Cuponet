// Conversión de filas de Supabase (snake_case) a los tipos del frontend
// (camelCase). Funciones puras y reutilizables; sin lógica de negocio.

import type {
  Comercio,
  Cupon,
  DashboardMetrics,
  Inscripcion,
  Movimiento,
  Plan,
  PlanId,
  PublicUser,
  PuntoCargadoDia,
  Role,
  Sorteo,
  SorteoStats,
  TipoMovimiento,
} from "./types"

// ---- Formas crudas de las filas tal como llegan de la base ----

export interface ProfileRow {
  id: string
  nombre: string
  apellido: string | null
  dni: string | null
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
  descripcion: string | null
  direccion: string | null
  telefono: string | null
  email: string | null
  activo: boolean
  created_at: string
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
  fecha_sorteo: string
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
  usuario_nombre?: string // solo en join con profiles (historial admin)
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
  descripcion: r.descripcion ?? "",
  direccion: r.direccion ?? null,
  telefono: r.telefono ?? null,
  email: r.email ?? null,
  activo: r.activo ?? true,
  createdAt: r.created_at ?? new Date().toISOString(),
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
  fechaSorteo: r.fecha_sorteo,
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
  usuarioNombre: r.usuario_nombre,
  tipo: r.tipo,
  fecha: r.fecha,
  detalle: r.detalle,
  creditos: r.creditos ?? undefined,
})

/**
 * Arma el PublicUser combinando la fila de perfil, el email de Auth y la
 * membresía vigente (la de mayor expiración, o null).
 */
// ---- Métricas (las RPC devuelven JSON en snake_case) ----

export const mapDashboardMetrics = (r: {
  total_usuarios: number
  nuevos_hoy: number
  membresias_activas: number
  cupones_canjeados_hoy: number
  sorteos_activos: number
  sorteos_finalizados: number
  puntos_cargados_hoy: number
}): DashboardMetrics => ({
  totalUsuarios: r.total_usuarios,
  nuevosHoy: r.nuevos_hoy,
  membresiasActivas: r.membresias_activas,
  cuponesCanjeadosHoy: r.cupones_canjeados_hoy,
  sorteosActivos: r.sorteos_activos,
  sorteosFinalizados: r.sorteos_finalizados,
  puntosCargadosHoy: r.puntos_cargados_hoy,
})

export const mapPuntoDia = (r: {
  dia: string
  total: number
}): PuntoCargadoDia => ({ dia: r.dia, total: r.total })

export const mapSorteoStats = (r: {
  sorteos_total: number
  sorteos_activos: number
  sorteos_finalizados: number
  participaciones: number
  usuarios_participantes: number
  puntos_utilizados: number
}): SorteoStats => ({
  sorteosTotal: r.sorteos_total,
  sorteosActivos: r.sorteos_activos,
  sorteosFinalizados: r.sorteos_finalizados,
  participaciones: r.participaciones,
  usuariosParticipantes: r.usuarios_participantes,
  puntosUtilizados: r.puntos_utilizados,
})

export const mapUser = (
  profile: ProfileRow,
  email: string,
  membership: MembershipRow | null
): PublicUser => ({
  id: profile.id,
  nombre: profile.nombre,
  apellido: profile.apellido ?? null,
  dni: profile.dni ?? null,
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
