import type { PublicUser, ServiceResult, User } from "./types"
import { findUser, genId, store, toPublicUser } from "./store"

/** R1: registro de un nuevo usuario con rol "cliente" por defecto. */
export function register(params: {
  nombre: string
  email: string
  password: string
}): ServiceResult<PublicUser> {
  const email = params.email.trim().toLowerCase()

  if (!params.nombre.trim() || !email || !params.password) {
    return { ok: false, error: "Completá todos los campos." }
  }
  if (store.users.some((u) => u.email.toLowerCase() === email)) {
    return { ok: false, error: "Ya existe una cuenta con ese email." }
  }

  const user: User = {
    id: genId("u"),
    nombre: params.nombre.trim(),
    email,
    password: params.password,
    role: "cliente", // rol por defecto
    creditos: 0, // usuarios nuevos arrancan en 0 (solo el admin carga créditos)
    membresia: null,
  }
  store.users.push(user)
  store.currentUserId = user.id
  return { ok: true, data: toPublicUser(user) }
}

/** R1: inicio de sesión con credenciales. */
export function login(
  email: string,
  password: string
): ServiceResult<PublicUser> {
  const normalized = email.trim().toLowerCase()
  const user = store.users.find((u) => u.email.toLowerCase() === normalized)

  if (!user || user.password !== password) {
    return { ok: false, error: "Email o contraseña incorrectos." }
  }

  store.currentUserId = user.id
  return { ok: true, data: toPublicUser(user) }
}

export function logout(): void {
  store.currentUserId = null
}

/** Lista de usuarios (para el panel admin), sin passwords. */
export function listarUsuarios(): PublicUser[] {
  return store.users.map(toPublicUser)
}

/** Lista solo los clientes (destino de carga de créditos). */
export function listarClientes(): PublicUser[] {
  return store.users.filter((u) => u.role === "cliente").map(toPublicUser)
}

/** Devuelve el usuario autenticado actual (sin password), o null. */
export function getCurrentUser(): PublicUser | null {
  if (!store.currentUserId) return null
  const user = findUser(store.currentUserId)
  return user ? toPublicUser(user) : null
}

export const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  listarUsuarios,
  listarClientes,
}
