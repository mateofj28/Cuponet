import type { ServiceResult } from "./types"
import { findUser } from "./store"
import { registrarMovimiento } from "./movimientos"

/** R5: saldo de créditos de un usuario. */
export function getSaldo(userId: string): ServiceResult<number> {
  const user = findUser(userId)
  if (!user) return { ok: false, error: "Usuario no encontrado." }
  return { ok: true, data: user.creditos }
}

/**
 * R5/R7: carga de créditos a un usuario. Solo el admin puede hacerlo.
 * @param adminId id del usuario que ejecuta la acción (debe ser admin).
 */
export function cargar(
  adminId: string,
  targetUserId: string,
  monto: number
): ServiceResult<number> {
  const admin = findUser(adminId)
  if (!admin || admin.role !== "admin") {
    return { ok: false, error: "Solo un administrador puede cargar créditos." }
  }
  if (!Number.isFinite(monto) || monto <= 0) {
    return { ok: false, error: "El monto debe ser mayor a 0." }
  }

  const target = findUser(targetUserId)
  if (!target) return { ok: false, error: "Usuario destino no encontrado." }

  target.creditos += monto
  registrarMovimiento({
    userId: target.id,
    tipo: "carga_creditos",
    detalle: `Carga de créditos realizada por ${admin.nombre}`,
    creditos: monto,
  })
  return { ok: true, data: target.creditos }
}

/**
 * Descuenta créditos de un usuario (uso interno de membership/raffle).
 * Impide que el saldo quede negativo (R5.3).
 */
export function descontar(
  userId: string,
  monto: number
): ServiceResult<number> {
  const user = findUser(userId)
  if (!user) return { ok: false, error: "Usuario no encontrado." }
  if (user.creditos < monto) {
    const faltan = monto - user.creditos
    return {
      ok: false,
      error: `Créditos insuficientes. Te faltan ${faltan} créditos.`,
    }
  }
  user.creditos -= monto
  return { ok: true, data: user.creditos }
}

export const creditService = { getSaldo, cargar, descontar }
