import { supabase } from "@/lib/supabase"
import type { Membership, Plan, PlanId, ServiceResult } from "./types"
import { mapPlan, type PlanRow } from "./mappers"
import { fail, ok, toErrorMessage } from "./result"

/** RS2: planes disponibles. */
export async function getPlanes(): Promise<Plan[]> {
  const { data, error } = await supabase
    .from("planes")
    .select("id, nombre, meses, costo_creditos")
    .order("costo_creditos")

  if (error || !data) return []
  return (data as PlanRow[]).map(mapPlan)
}

/** Indica si una membresía está activa en la fecha actual. */
export function esMembresiaActiva(membresia: Membership | null): boolean {
  if (!membresia) return false
  return new Date(membresia.expiracion).getTime() > Date.now()
}

/** RS5: compra de un plan pagando con créditos (vía RPC atómica). */
export async function comprarPlan(planId: PlanId): Promise<ServiceResult> {
  const { error } = await supabase.rpc("comprar_membresia", {
    p_plan_id: planId,
  })
  if (error) return fail(toErrorMessage(error))
  return ok(undefined)
}

export const membershipService = {
  getPlanes,
  comprarPlan,
  esMembresiaActiva,
}
