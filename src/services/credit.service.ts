import { supabase } from "@/lib/supabase"
import type { ServiceResult } from "./types"
import { fail, ok, toErrorMessage } from "./result"

/** RS5: saldo de créditos de un usuario. */
export async function getSaldo(userId: string): Promise<ServiceResult<number>> {
  const { data, error } = await supabase
    .from("profiles")
    .select("creditos")
    .eq("id", userId)
    .single<{ creditos: number }>()

  if (error || !data) return fail("No se pudo obtener el saldo.")
  return ok(data.creditos)
}

/**
 * RS5/RS7: carga de créditos a un usuario. La validación de que quien
 * ejecuta es admin ocurre en la función `cargar_creditos` (security definer).
 */
export async function cargar(
  targetUserId: string,
  monto: number
): Promise<ServiceResult> {
  const { error } = await supabase.rpc("cargar_creditos", {
    p_target: targetUserId,
    p_monto: monto,
  })
  if (error) return fail(toErrorMessage(error))
  return ok(undefined)
}

export const creditService = { getSaldo, cargar }
