import { supabase } from "@/lib/supabase"
import type { Movimiento, TipoMovimiento } from "./types"
import { mapMovimiento, type MovimientoRow } from "./mappers"

const SELECT_MOV = "id, user_id, tipo, fecha, detalle, creditos"

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

/**
 * R7.5 / RA10: historial global de la plataforma (RLS: solo admin lee todo).
 * Filtro opcional por tipo de movimiento; sin filtro, trae todos.
 */
export async function listarGlobal(
  tipo?: TipoMovimiento
): Promise<Movimiento[]> {
  let query = supabase
    .from("movimientos")
    .select(SELECT_MOV)
    .order("fecha", { ascending: false })

  if (tipo) query = query.eq("tipo", tipo)

  const { data, error } = await query
  if (error || !data) return []
  return (data as MovimientoRow[]).map(mapMovimiento)
}

export const historyService = { listarPorUsuario, listarGlobal }
