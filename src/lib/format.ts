// Formato de números y etiquetas para la UI.

import type { PlanId } from "@/services"

const creditosFormatter = new Intl.NumberFormat("es-AR")

/** Nombre legible de un plan a partir de su id. */
export const NOMBRE_PLAN: Record<PlanId, string> = {
  plan1: "Plan 1",
  plan3: "Plan 3",
  black: "Plan Black",
}

export function nombrePlan(planId: PlanId | null): string {
  return planId ? NOMBRE_PLAN[planId] : "Sin plan"
}

/**
 * Formatea una cantidad de créditos con separador de miles.
 * Ej: 5370 -> "5.370" · 6000 -> "6.000"
 */
export function formatCreditos(n: number): string {
  return creditosFormatter.format(n)
}

/** Igual que formatCreditos pero con signo explícito (+/-), para movimientos. */
export function formatCreditosSigned(n: number): string {
  const sign = n > 0 ? "+" : n < 0 ? "-" : ""
  return `${sign}${creditosFormatter.format(Math.abs(n))}`
}
