import { isAfter, parseISO } from "date-fns"
import type { Inscripcion, ServiceResult, Sorteo } from "./types"
import { findUser, genId, store } from "./store"
import { esMembresiaActiva } from "./membership.service"
import { descontar } from "./credit.service"
import { registrarMovimiento } from "./movimientos"

/** Marca como cerrado cualquier sorteo cuya fecha de cierre ya pasó (R4.5). */
function sincronizarEstados(): void {
  const now = new Date()
  for (const sorteo of store.sorteos) {
    if (sorteo.estado === "activo" && !isAfter(parseISO(sorteo.cierre), now)) {
      sorteo.estado = "cerrado"
    }
  }
}

/** R4.1: lista los sorteos activos (tras sincronizar los que ya cerraron). */
export function listarActivos(): Sorteo[] {
  sincronizarEstados()
  return store.sorteos.filter((s) => s.estado === "activo")
}

/** Detalle de un sorteo por id. */
export function getById(id: string): Sorteo | null {
  sincronizarEstados()
  return store.sorteos.find((s) => s.id === id) ?? null
}

/** Números que un usuario tiene asignados en un sorteo. */
export function getInscripcion(
  userId: string,
  sorteoId: string
): Inscripcion | null {
  return (
    store.inscripciones.find(
      (i) => i.userId === userId && i.sorteoId === sorteoId
    ) ?? null
  )
}

/** Cantidad de números ya asignados en un sorteo. */
function numerosAsignados(sorteoId: string): number {
  return store.inscripciones
    .filter((i) => i.sorteoId === sorteoId)
    .reduce((acc, i) => acc + i.numeros.length, 0)
}

/**
 * R4.2/R4.3/R4.5: inscribe al usuario en un sorteo.
 * Requiere membresía activa, sorteo activo y créditos suficientes.
 * Descuenta créditos y asigna un número (definido por el sistema).
 */
export function inscribir(
  userId: string,
  sorteoId: string
): ServiceResult<Inscripcion> {
  const user = findUser(userId)
  if (!user) return { ok: false, error: "Usuario no encontrado." }

  if (!esMembresiaActiva(user.membresia)) {
    return {
      ok: false,
      error: "Necesitás una membresía activa para participar en sorteos.",
    }
  }

  sincronizarEstados()
  const sorteo = store.sorteos.find((s) => s.id === sorteoId)
  if (!sorteo) return { ok: false, error: "Sorteo no encontrado." }
  if (sorteo.estado !== "activo") {
    return { ok: false, error: "Este sorteo ya está cerrado." }
  }

  const asignados = numerosAsignados(sorteoId)
  if (asignados >= sorteo.numerosEnJuego) {
    return { ok: false, error: "No quedan números disponibles." }
  }

  const descuentoResult = descontar(userId, sorteo.costoCreditos)
  if (!descuentoResult.ok) return descuentoResult

  // Número asignado por el sistema (secuencial sobre los ya tomados).
  const nuevoNumero = asignados + 1

  const existente = getInscripcion(userId, sorteoId)
  let inscripcion: Inscripcion
  if (existente) {
    existente.numeros.push(nuevoNumero)
    inscripcion = existente
  } else {
    inscripcion = {
      id: genId("insc"),
      sorteoId,
      userId,
      numeros: [nuevoNumero],
    }
    store.inscripciones.push(inscripcion)
  }

  registrarMovimiento({
    userId: user.id,
    tipo: "inscripcion_sorteo",
    detalle: `Inscripción en "${sorteo.titulo}" (número ${nuevoNumero})`,
    creditos: -sorteo.costoCreditos,
  })

  return { ok: true, data: inscripcion }
}

/** R7.4: cierra manualmente un sorteo (admin). */
export function cerrar(sorteoId: string): ServiceResult {
  const sorteo = store.sorteos.find((s) => s.id === sorteoId)
  if (!sorteo) return { ok: false, error: "Sorteo no encontrado." }
  sorteo.estado = "cerrado"
  return { ok: true, data: undefined }
}

// ---- Operaciones de administración (R7.4) ----

/** Lista todos los sorteos (activos y cerrados) para el panel admin. */
export function listarTodos(): Sorteo[] {
  sincronizarEstados()
  return [...store.sorteos]
}

export type SorteoInput = Omit<Sorteo, "id" | "estado">

export function crear(input: SorteoInput): ServiceResult<Sorteo> {
  if (!input.titulo.trim() || !input.productoPrincipal.trim()) {
    return { ok: false, error: "Título y producto principal son obligatorios." }
  }
  const sorteo: Sorteo = { id: genId("sorteo"), estado: "activo", ...input }
  store.sorteos.push(sorteo)
  return { ok: true, data: sorteo }
}

export function actualizar(
  id: string,
  input: Partial<SorteoInput>
): ServiceResult<Sorteo> {
  const sorteo = store.sorteos.find((s) => s.id === id)
  if (!sorteo) return { ok: false, error: "Sorteo no encontrado." }
  Object.assign(sorteo, input)
  return { ok: true, data: sorteo }
}

export const raffleService = {
  listarActivos,
  getById,
  getInscripcion,
  inscribir,
  cerrar,
  listarTodos,
  crear,
  actualizar,
}
