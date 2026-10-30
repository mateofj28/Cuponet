import { supabase } from "@/lib/supabase"
import type { Comercio, Cupon, ServiceResult } from "./types"
import {
  mapComercio,
  mapCupon,
  type ComercioRow,
  type CuponRow,
} from "./mappers"
import { fail, ok, toErrorMessage } from "./result"

export interface CuponConComercio extends Cupon {
  comercio: Comercio | null
}

const SELECT_CON_COMERCIO =
  "id, comercio_id, titulo, descripcion, descuento, vencimiento, comercios ( id, nombre, instagram_url )"

type CuponJoinRow = CuponRow & { comercios: ComercioRow | null }

const mapJoin = (r: CuponJoinRow): CuponConComercio => ({
  ...mapCupon(r),
  comercio: r.comercios ? mapComercio(r.comercios) : null,
})

/** R3.1: cupones vigentes (no vencidos) con su comercio. */
export async function listarVigentes(): Promise<CuponConComercio[]> {
  const { data, error } = await supabase
    .from("cupones")
    .select(SELECT_CON_COMERCIO)
    .gt("vencimiento", new Date().toISOString())
    .order("vencimiento")

  if (error || !data) return []
  return (data as unknown as CuponJoinRow[]).map(mapJoin)
}

/** R3.2: detalle de un cupón por id (incluye vencidos). */
export async function getById(id: string): Promise<CuponConComercio | null> {
  const { data, error } = await supabase
    .from("cupones")
    .select(SELECT_CON_COMERCIO)
    .eq("id", id)
    .maybeSingle()

  if (error || !data) return null
  return mapJoin(data as unknown as CuponJoinRow)
}

/** R3.3/R3.4: canje vía RPC (valida membresía activa y vigencia). */
export async function canjear(cuponId: string): Promise<ServiceResult> {
  const { error } = await supabase.rpc("canjear_cupon", { p_cupon_id: cuponId })
  if (error) return fail(toErrorMessage(error))
  return ok(undefined)
}

// ---- Administración (RLS exige admin para escribir) ----

export async function listarTodos(): Promise<CuponConComercio[]> {
  const { data, error } = await supabase
    .from("cupones")
    .select(SELECT_CON_COMERCIO)
    .order("vencimiento", { ascending: false })

  if (error || !data) return []
  return (data as unknown as CuponJoinRow[]).map(mapJoin)
}

export async function listarComercios(): Promise<Comercio[]> {
  const { data, error } = await supabase
    .from("comercios")
    .select("id, nombre, instagram_url")
    .order("nombre")

  if (error || !data) return []
  return (data as ComercioRow[]).map(mapComercio)
}

export interface CuponInput {
  comercioId: string
  titulo: string
  descripcion: string
  descuento: string
  vencimiento: string
}

export async function crear(input: CuponInput): Promise<ServiceResult> {
  const { error } = await supabase.from("cupones").insert({
    comercio_id: input.comercioId,
    titulo: input.titulo,
    descripcion: input.descripcion,
    descuento: input.descuento,
    vencimiento: input.vencimiento,
  })
  if (error) return fail(toErrorMessage(error, "No se pudo crear el cupón."))
  return ok(undefined)
}

export async function actualizar(
  id: string,
  input: Partial<CuponInput>
): Promise<ServiceResult> {
  const payload: Record<string, unknown> = {}
  if (input.comercioId !== undefined) payload.comercio_id = input.comercioId
  if (input.titulo !== undefined) payload.titulo = input.titulo
  if (input.descripcion !== undefined) payload.descripcion = input.descripcion
  if (input.descuento !== undefined) payload.descuento = input.descuento
  if (input.vencimiento !== undefined) payload.vencimiento = input.vencimiento

  const { error } = await supabase.from("cupones").update(payload).eq("id", id)
  if (error) return fail(toErrorMessage(error, "No se pudo actualizar el cupón."))
  return ok(undefined)
}

export async function eliminar(id: string): Promise<ServiceResult> {
  const { error } = await supabase.from("cupones").delete().eq("id", id)
  if (error) return fail(toErrorMessage(error, "No se pudo eliminar el cupón."))
  return ok(undefined)
}

export const couponService = {
  listarVigentes,
  getById,
  canjear,
  listarTodos,
  listarComercios,
  crear,
  actualizar,
  eliminar,
}
