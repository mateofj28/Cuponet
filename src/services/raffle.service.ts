import { supabase } from "@/lib/supabase"
import type { Inscripcion, ServiceResult, Sorteo } from "./types"
import {
  mapInscripcion,
  mapSorteo,
  type InscripcionRow,
  type SorteoRow,
} from "./mappers"
import { fail, ok, toErrorMessage } from "./result"

const SELECT_SORTEO =
  "id, titulo, producto_principal, productos_secundarios, cierre, fecha_sorteo, numeros_en_juego, costo_creditos, estado"

/** R4.1: sorteos activos (y aún no vencidos). */
export async function listarActivos(): Promise<Sorteo[]> {
  const { data, error } = await supabase
    .from("sorteos")
    .select(SELECT_SORTEO)
    .eq("estado", "activo")
    .gt("cierre", new Date().toISOString())
    .order("cierre")

  if (error || !data) return []
  return (data as SorteoRow[]).map(mapSorteo)
}

export async function getById(id: string): Promise<Sorteo | null> {
  const { data, error } = await supabase
    .from("sorteos")
    .select(SELECT_SORTEO)
    .eq("id", id)
    .maybeSingle<SorteoRow>()

  if (error || !data) return null
  return mapSorteo(data)
}

/** Inscripción propia del usuario en un sorteo (RLS: solo la suya). */
export async function getInscripcion(
  userId: string,
  sorteoId: string
): Promise<Inscripcion | null> {
  const { data, error } = await supabase
    .from("inscripciones")
    .select("id, sorteo_id, user_id, numeros")
    .eq("user_id", userId)
    .eq("sorteo_id", sorteoId)
    .maybeSingle<InscripcionRow>()

  if (error || !data) return null
  return mapInscripcion(data)
}

/** R4.2/R4.3: inscripción vía RPC. Devuelve el número asignado. */
export async function inscribir(
  sorteoId: string
): Promise<ServiceResult<number>> {
  const { data, error } = await supabase.rpc("inscribir_sorteo", {
    p_sorteo_id: sorteoId,
  })
  if (error) return fail(toErrorMessage(error))
  return ok(data as number)
}

// ---- Administración ----

export async function listarTodos(): Promise<Sorteo[]> {
  const { data, error } = await supabase
    .from("sorteos")
    .select(SELECT_SORTEO)
    .order("created_at", { ascending: false })

  if (error || !data) return []
  return (data as SorteoRow[]).map(mapSorteo)
}

export interface SorteoInput {
  titulo: string
  productoPrincipal: string
  productosSecundarios: string[]
  cierre: string
  fechaSorteo: string
  numerosEnJuego: number
  costoCreditos: number
}

export async function crear(input: SorteoInput): Promise<ServiceResult> {
  const { error } = await supabase.from("sorteos").insert({
    titulo: input.titulo,
    producto_principal: input.productoPrincipal,
    productos_secundarios: input.productosSecundarios,
    cierre: input.cierre,
    fecha_sorteo: input.fechaSorteo,
    numeros_en_juego: input.numerosEnJuego,
    costo_creditos: input.costoCreditos,
  })
  if (error) return fail(toErrorMessage(error, "No se pudo crear el sorteo."))
  return ok(undefined)
}

export async function actualizar(
  id: string,
  input: Partial<SorteoInput>
): Promise<ServiceResult> {
  const payload: Record<string, unknown> = {}
  if (input.titulo !== undefined) payload.titulo = input.titulo
  if (input.productoPrincipal !== undefined)
    payload.producto_principal = input.productoPrincipal
  if (input.productosSecundarios !== undefined)
    payload.productos_secundarios = input.productosSecundarios
  if (input.cierre !== undefined) payload.cierre = input.cierre
  if (input.fechaSorteo !== undefined) payload.fecha_sorteo = input.fechaSorteo
  if (input.numerosEnJuego !== undefined)
    payload.numeros_en_juego = input.numerosEnJuego
  if (input.costoCreditos !== undefined)
    payload.costo_creditos = input.costoCreditos

  const { error } = await supabase.from("sorteos").update(payload).eq("id", id)
  if (error) return fail(toErrorMessage(error, "No se pudo actualizar el sorteo."))
  return ok(undefined)
}

export async function cerrar(id: string): Promise<ServiceResult> {
  const { error } = await supabase
    .from("sorteos")
    .update({ estado: "cerrado" })
    .eq("id", id)
  if (error) return fail(toErrorMessage(error, "No se pudo cerrar el sorteo."))
  return ok(undefined)
}

export const raffleService = {
  listarActivos,
  getById,
  getInscripcion,
  inscribir,
  listarTodos,
  crear,
  actualizar,
  cerrar,
}
