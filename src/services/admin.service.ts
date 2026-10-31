import { supabase } from "@/lib/supabase"
import type {
  DashboardMetrics,
  PlanId,
  PuntoCargadoDia,
  Role,
  SorteoStats,
  UsuarioAdmin,
} from "./types"
import {
  mapDashboardMetrics,
  mapPuntoDia,
  mapSorteoStats,
} from "./mappers"

// ---- Métricas (vía RPC; devuelven null ante error de permisos/red) ----

export async function dashboardMetrics(): Promise<DashboardMetrics | null> {
  const { data, error } = await supabase.rpc("admin_dashboard_metrics")
  if (error || !data) return null
  return mapDashboardMetrics(data)
}

export async function puntosCargadosSemana(): Promise<PuntoCargadoDia[]> {
  const { data, error } = await supabase.rpc("admin_puntos_cargados_semana")
  if (error || !data) return []
  return (data as unknown[]).map((r) =>
    mapPuntoDia(r as { dia: string; total: number })
  )
}

export interface SorteoStatsFiltro {
  desde?: string | null
  hasta?: string | null
  estado?: "activo" | "cerrado" | null
}

export async function sorteoStats(
  filtro: SorteoStatsFiltro = {}
): Promise<SorteoStats | null> {
  const { data, error } = await supabase.rpc("admin_sorteo_stats", {
    p_desde: filtro.desde ?? null,
    p_hasta: filtro.hasta ?? null,
    p_estado: filtro.estado ?? null,
  })
  if (error || !data) return null
  return mapSorteoStats(data)
}

// ---- Usuarios (RLS permite al admin leer todos los perfiles) ----

/** Fila plana devuelta por la función admin_listar_usuarios. */
interface UsuarioFnRow {
  id: string
  nombre: string
  apellido: string | null
  dni: string | null
  email: string | null
  role: Role
  creditos: number
  puntos_utilizados: number
  created_at: string
  plan_id: PlanId | null
  membresia_inicio: string | null
  membresia_expiracion: string | null
}

function mapUsuarioFn(r: UsuarioFnRow): UsuarioAdmin {
  return {
    id: r.id,
    nombre: r.nombre,
    apellido: r.apellido,
    dni: r.dni,
    email: r.email ?? "",
    role: r.role,
    creditos: r.creditos,
    puntosUtilizados: r.puntos_utilizados,
    createdAt: r.created_at,
    planId: r.plan_id,
    membresiaInicio: r.membresia_inicio,
    membresiaExpiracion: r.membresia_expiracion,
  }
}

/** RA3: lista de usuarios con saldo y puntos utilizados (vía función). */
export async function listarUsuarios(): Promise<UsuarioAdmin[]> {
  const { data, error } = await supabase.rpc("admin_listar_usuarios")
  if (error || !data) return []
  return (data as UsuarioFnRow[]).map(mapUsuarioFn)
}

/** RA5: búsqueda dinámica de clientes por email o DNI. */
export async function buscarUsuarios(query: string): Promise<UsuarioAdmin[]> {
  const q = query.trim()
  if (!q) return []
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, nombre, apellido, dni, email, role, creditos, created_at, memberships ( plan_id, inicio, expiracion )"
    )
    .or(`email.ilike.%${q}%,dni.ilike.%${q}%`)
    .eq("role", "cliente")
    .limit(10)

  if (error || !data) return []
  return (data as unknown[]).map((row) => {
    const r = row as {
      id: string
      nombre: string
      apellido: string | null
      dni: string | null
      email: string | null
      role: Role
      creditos: number
      created_at: string
      memberships: { plan_id: PlanId; inicio: string; expiracion: string }[]
    }
    const vigente = [...(r.memberships ?? [])].sort((a, b) =>
      a.expiracion < b.expiracion ? 1 : -1
    )[0]
    return {
      id: r.id,
      nombre: r.nombre,
      apellido: r.apellido,
      dni: r.dni,
      email: r.email ?? "",
      role: r.role,
      creditos: r.creditos,
      puntosUtilizados: 0, // no requerido en el buscador
      createdAt: r.created_at,
      planId: vigente?.plan_id ?? null,
      membresiaInicio: vigente?.inicio ?? null,
      membresiaExpiracion: vigente?.expiracion ?? null,
    }
  })
}

export const adminService = {
  dashboardMetrics,
  puntosCargadosSemana,
  sorteoStats,
  listarUsuarios,
  buscarUsuarios,
}
