import type {
  Comercio,
  Cupon,
  Inscripcion,
  Movimiento,
  Sorteo,
  User,
} from "./types"
import {
  seedComercios,
  seedCupones,
  seedInscripciones,
  seedMovimientos,
  seedSorteos,
  seedUsers,
} from "./mockData"

/**
 * Store en memoria compartido por todos los servicios mock.
 * El estado vive mientras la pestaña esté abierta y se pierde al recargar
 * (ver design.md). Se clona la semilla para no mutar las constantes de origen.
 */
interface Store {
  users: User[]
  comercios: Comercio[]
  cupones: Cupon[]
  sorteos: Sorteo[]
  inscripciones: Inscripcion[]
  movimientos: Movimiento[]
  currentUserId: string | null
}

const clone = <T,>(arr: T[]): T[] => arr.map((x) => ({ ...x }))

export const store: Store = {
  users: clone(seedUsers),
  comercios: clone(seedComercios),
  cupones: clone(seedCupones),
  sorteos: clone(seedSorteos),
  inscripciones: clone(seedInscripciones),
  movimientos: clone(seedMovimientos),
  currentUserId: null,
}

let idCounter = 0
/** Genera un id único simple para entidades creadas en runtime. */
export const genId = (prefix: string): string => {
  idCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`
}

/** Quita el password de un usuario antes de exponerlo a la UI. */
export const toPublicUser = (user: User) => {
  const { password: _password, ...rest } = user
  return rest
}

export const findUser = (id: string): User | undefined =>
  store.users.find((u) => u.id === id)
