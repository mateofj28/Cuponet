import type { Movimiento, TipoMovimiento } from "./types"
import { genId, store } from "./store"

/** Registra un movimiento en el historial (uso interno de los servicios). */
export function registrarMovimiento(params: {
  userId: string
  tipo: TipoMovimiento
  detalle: string
  creditos?: number
}): Movimiento {
  const mov: Movimiento = {
    id: genId("mov"),
    userId: params.userId,
    tipo: params.tipo,
    fecha: new Date().toISOString(),
    detalle: params.detalle,
    creditos: params.creditos,
  }
  store.movimientos.push(mov)
  return mov
}
