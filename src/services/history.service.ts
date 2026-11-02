import { supabase } from "@/lib/supabase"
import type { Movimiento, TipoMovimiento } from "./types"
import { mapMovimiento, type MovimientoRow } from "./mappers"

const SELECT_MOV = "id, user_id, tipo, fecha, detalle, creditos"
const SELECT_MOV_ADMIN =
  "id, user_id, tipo, fecha, detalle, creditos, profiles ( nombre, apellido )"

/** R6: movimientos de un usuario, del más reciente al más antiguo. */
export async function listarPorUsuario(userId: string): Promise<Movimiento[]> {
  const { data, error } = await supabase
    .from("movimientos")
    .select(SELECT_MOV)
    .eq("user_id", userId)
    .order("fecha", { ascending: false })

  if (error || !data) return []
  return (data as MovimientoRow[]).map(mapMovimiento)
}

export interface MovimientoGlobalFiltro {
  tipo?: TipoMovimiento
  desde?: string | null // ISO date string "YYYY-MM-DD"
  hasta?: string | null
}

/** R7.5 / RA10: historial global con nombre del usuario (join profiles). */
export async function listarGlobal(
  filtro: MovimientoGlobalFiltro | TipoMovimiento = {}
): Promise<Movimiento[]> {
  // Acepta string (tipo) o objeto con filtros para retrocompatibilidad.
  const opts: MovimientoGlobalFiltro =
    typeof filtro === "string" ? { tipo: filtro } : filtro

  type Row = {
    id: string; user_id: string; tipo: TipoMovimiento
    fecha: string; detalle: string; creditos: number | null
    profiles: { nombre: string; apellido: string | null } | null
  }

  let query = supabase
    .from("movimientos")
    .select(SELECT_MOV_ADMIN)
    .order("fecha", { ascending: false })

  if (opts.tipo) query = query.eq("tipo", opts.tipo)
  if (opts.desde) query = query.gte("fecha", new Date(opts.desde).toISOString())
  if (opts.hasta) {
    const h = new Date(opts.hasta)
    h.setHours(23, 59, 59, 999)
    query = query.lte("fecha", h.toISOString())
  }

  const { data, error } = await query
  if (error || !data) return []

  return (data as unknown as Row[]).map((r) => ({
    id: r.id,
    userId: r.user_id,
    usuarioNombre: r.profiles
      ? `${r.profiles.nombre}${r.profiles.apellido ? " " + r.profiles.apellido : ""}`
      : undefined,
    tipo: r.tipo,
    fecha: r.fecha,
    detalle: r.detalle,
    creditos: r.creditos ?? undefined,
  }))
}

export const historyService = { listarPorUsuario, listarGlobal }
