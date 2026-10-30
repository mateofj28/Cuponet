// Formato de números para la UI.

const creditosFormatter = new Intl.NumberFormat("es-AR")

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
