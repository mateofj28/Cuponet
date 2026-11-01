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
 * Formatea para gráficos: abrevia valores grandes para que quepan.
 * Ej: 2006900 → "2M" · 53200 → "53K" · 850 → "850"
 */
export function formatAbrev(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)}K`
  return String(n)
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
