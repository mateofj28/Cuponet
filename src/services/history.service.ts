import { compareDesc, parseISO } from "date-fns"
import type { Movimiento } from "./types"
import { store } from "./store"

const porFechaDesc = (a: Movimiento, b: Movimiento) =>
  compareDesc(parseISO(a.fecha), parseISO(b.fecha))

/** R6: movimientos de un usuario, del más reciente al más antiguo. */
export function listarPorUsuario(userId: string): Movimiento[] {
  return store.movimientos
    .filter((m) => m.userId === userId)
    .sort(porFechaDesc)
}

/** R7.5: historial global de la plataforma (admin). */
export function listarGlobal(): Movimiento[] {
  return [...store.movimientos].sort(porFechaDesc)
}

export const historyService = { listarPorUsuario, listarGlobal }
