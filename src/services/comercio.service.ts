import { supabase } from "@/lib/supabase"
import type { Comercio, ServiceResult } from "./types"
import { mapComercio, type ComercioRow } from "./mappers"
import { fail, ok, toErrorMessage } from "./result"

const SELECT =
  "id, nombre, instagram_url, descripcion, direccion, telefono, email, activo, created_at"

export async function listar(): Promise<Comercio[]> {
  const { data, error } = await supabase
    .from("comercios")
    .select(SELECT)
    .order("nombre")
  if (error || !data) return []
  return (data as ComercioRow[]).map(mapComercio)
}

export interface ComercioInput {
  nombre: string
  descripcion: string
  direccion: string
  telefono: string
  email: string
  instagramUrl: string
}

function toRow(input: Partial<ComercioInput>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (input.nombre !== undefined) row.nombre = input.nombre
  if (input.descripcion !== undefined) row.descripcion = input.descripcion
  if (input.direccion !== undefined) row.direccion = input.direccion || null
  if (input.telefono !== undefined) row.telefono = input.telefono || null
  if (input.email !== undefined) row.email = input.email || null
  if (input.instagramUrl !== undefined)
    row.instagram_url = input.instagramUrl || null
  return row
}

export async function crear(input: ComercioInput): Promise<ServiceResult> {
  if (!input.nombre.trim()) return fail("El nombre es obligatorio.")
  const { error } = await supabase.from("comercios").insert(toRow(input))
  if (error) return fail(toErrorMessage(error, "No se pudo crear el comercio."))
  return ok(undefined)
}

export async function actualizar(
  id: string,
  input: Partial<ComercioInput>
): Promise<ServiceResult> {
  const { error } = await supabase
    .from("comercios")
    .update(toRow(input))
    .eq("id", id)
  if (error)
    return fail(toErrorMessage(error, "No se pudo actualizar el comercio."))
  return ok(undefined)
}

/** Activa o desactiva un comercio. */
export async function setActivo(
  id: string,
  activo: boolean
): Promise<ServiceResult> {
  const { error } = await supabase
    .from("comercios")
    .update({ activo })
    .eq("id", id)
  if (error) return fail(toErrorMessage(error, "No se pudo cambiar el estado."))
  return ok(undefined)
}

export async function eliminar(id: string): Promise<ServiceResult> {
  const { error } = await supabase.from("comercios").delete().eq("id", id)
  if (error)
    return fail(toErrorMessage(error, "No se pudo eliminar el comercio."))
  return ok(undefined)
}

export const comercioService = {
  listar,
  crear,
  actualizar,
  setActivo,
  eliminar,
}
