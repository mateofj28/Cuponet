import { supabase } from "@/lib/supabase"
import type { Movimiento } from "./types"
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

/** R7.5: historial global de la plataforma (RLS: solo admin lee todo). */
export async function listarGlobal(): Promise<Movimiento[]> {
  const { data, error } = await supabase
    .from("movimientos")
    .select(SELECT_MOV)
    .order("fecha", { ascending: false })

  if (error || !data) return []
  return (data as MovimientoRow[]).map(mapMovimiento)
}

export const historyService = { listarPorUsuario, listarGlobal }
