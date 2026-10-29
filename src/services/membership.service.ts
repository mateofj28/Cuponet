import { addMonths, isAfter, parseISO } from "date-fns"
import type { Membership, Plan, PlanId, ServiceResult } from "./types"
import { PLANES } from "./mockData"
import { findUser } from "./store"
import { descontar } from "./credit.service"
import { registrarMovimiento } from "./movimientos"

/** R2: devuelve los planes disponibles. */
export function getPlanes(): Plan[] {
  return PLANES
}

/** Indica si una membresía está activa en la fecha actual. */
export function esMembresiaActiva(membresia: Membership | null): boolean {
  if (!membresia) return false
  return isAfter(parseISO(membresia.expiracion), new Date())
}

/**
 * R2: compra de un plan pagando con créditos.
 * Descuenta el costo, activa la membresía y registra el movimiento.
 */
export function comprarPlan(
  userId: string,
  planId: PlanId
): ServiceResult<Membership> {
  const user = findUser(userId)
  if (!user) return { ok: false, error: "Usuario no encontrado." }

  const plan = PLANES.find((p) => p.id === planId)
  if (!plan) return { ok: false, error: "Plan inválido." }

  const descuentoResult = descontar(userId, plan.costoCreditos)
  if (!descuentoResult.ok) return descuentoResult

  const inicio = new Date()
  const membresia: Membership = {
    planId: plan.id,
    inicio: inicio.toISOString(),
    expiracion: addMonths(inicio, plan.meses).toISOString(),
  }
  user.membresia = membresia

  registrarMovimiento({
    userId: user.id,
    tipo: "compra_membresia",
    detalle: `Compra de ${plan.nombre} (${plan.meses} mes/es)`,
    creditos: -plan.costoCreditos,
  })

  return { ok: true, data: membresia }
}

export const membershipService = {
  getPlanes,
  comprarPlan,
  esMembresiaActiva,
}
