import { isAfter, parseISO } from "date-fns"
import type { Comercio, Cupon, ServiceResult } from "./types"
import { findUser, genId, store } from "./store"
import { esMembresiaActiva } from "./membership.service"
import { registrarMovimiento } from "./movimientos"

export interface CuponConComercio extends Cupon {
  comercio: Comercio | null
}

const esVigente = (cupon: Cupon): boolean =>
  isAfter(parseISO(cupon.vencimiento), new Date())

const withComercio = (cupon: Cupon): CuponConComercio => ({
  ...cupon,
  comercio: store.comercios.find((c) => c.id === cupon.comercioId) ?? null,
})

/** R3.1: lista los cupones vigentes (no vencidos) con su comercio. */
export function listarVigentes(): CuponConComercio[] {
  return store.cupones.filter(esVigente).map(withComercio)
}

/** R3.2: detalle de un cupón por id (incluye vencidos, para mostrar estado). */
export function getById(id: string): CuponConComercio | null {
  const cupon = store.cupones.find((c) => c.id === id)
  return cupon ? withComercio(cupon) : null
}

/**
 * R3.3/R3.4: canje de un cupón. Gratis con membresía activa; no descuenta
 * créditos. Impide canjear cupones vencidos o sin membresía activa.
 */
export function canjear(userId: string, cuponId: string): ServiceResult {
  const user = findUser(userId)
  if (!user) return { ok: false, error: "Usuario no encontrado." }

  if (!esMembresiaActiva(user.membresia)) {
    return {
      ok: false,
      error: "Necesitás una membresía activa para canjear cupones.",
    }
  }

  const cupon = store.cupones.find((c) => c.id === cuponId)
  if (!cupon) return { ok: false, error: "Cupón no encontrado." }
  if (!esVigente(cupon)) {
    return { ok: false, error: "Este cupón está vencido." }
  }

  const comercio = store.comercios.find((c) => c.id === cupon.comercioId)
  registrarMovimiento({
    userId: user.id,
    tipo: "canje_cupon",
    detalle: `Canje de "${cupon.titulo}"${comercio ? ` en ${comercio.nombre}` : ""
      }`,
  })

  return { ok: true, data: undefined }
}

// ---- Operaciones de administración (R7.3) ----

/** Lista todos los cupones (incluidos vencidos) para el panel admin. */
export function listarTodos(): CuponConComercio[] {
  return store.cupones.map(withComercio)
}

export function listarComercios(): Comercio[] {
  return store.comercios
}

export type CuponInput = Omit<Cupon, "id">

export function crear(input: CuponInput): ServiceResult<Cupon> {
  if (!input.titulo.trim() || !input.comercioId) {
    return { ok: false, error: "Título y comercio son obligatorios." }
  }
  const cupon: Cupon = { id: genId("cup"), ...input }
  store.cupones.push(cupon)
  return { ok: true, data: cupon }
}

export function actualizar(
  id: string,
  input: Partial<CuponInput>
): ServiceResult<Cupon> {
  const cupon = store.cupones.find((c) => c.id === id)
  if (!cupon) return { ok: false, error: "Cupón no encontrado." }
  Object.assign(cupon, input)
  return { ok: true, data: cupon }
}

export function eliminar(id: string): ServiceResult {
  const idx = store.cupones.findIndex((c) => c.id === id)
  if (idx === -1) return { ok: false, error: "Cupón no encontrado." }
  store.cupones.splice(idx, 1)
  return { ok: true, data: undefined }
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
