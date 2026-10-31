import type { User as AuthUser } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import type { PublicUser, ServiceResult } from "./types"
import {
  mapUser,
  type MembershipRow,
  type ProfileRow,
} from "./mappers"
import { fail, ok, toErrorMessage } from "./result"

/**
 * Carga el perfil + membresía vigente de un usuario de Auth y arma el
 * PublicUser. La membresía vigente es la de mayor expiración.
 */
async function cargarPerfil(authUser: AuthUser): Promise<PublicUser | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, nombre, apellido, dni, role, creditos")
    .eq("id", authUser.id)
    .single<ProfileRow>()

  if (error || !profile) return null

  const { data: membership } = await supabase
    .from("memberships")
    .select("plan_id, inicio, expiracion")
    .eq("user_id", authUser.id)
    .order("expiracion", { ascending: false })
    .limit(1)
    .maybeSingle<MembershipRow>()

  return mapUser(profile, authUser.email ?? "", membership ?? null)
}

/** RS3.1 / RA1: registro. El perfil lo crea el trigger handle_new_user. */
export async function register(params: {
  nombre: string
  apellido: string
  dni: string
  email: string
  password: string
}): Promise<ServiceResult<PublicUser>> {
  const email = params.email.trim().toLowerCase()
  if (
    !params.nombre.trim() ||
    !params.apellido.trim() ||
    !params.dni.trim() ||
    !email ||
    !params.password
  ) {
    return fail("Completá todos los campos.")
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: params.password,
    options: {
      data: {
        nombre: params.nombre.trim(),
        apellido: params.apellido.trim(),
        dni: params.dni.trim(),
      },
    },
  })
  if (error) return fail(toErrorMessage(error, "No se pudo crear la cuenta."))
  if (!data.user) return fail("No se pudo crear la cuenta.")

  const perfil = await cargarPerfil(data.user)
  return perfil ? ok(perfil) : fail("Cuenta creada, pero no se pudo cargar el perfil.")
}

/** RS3.2: inicio de sesión. */
export async function login(
  email: string,
  password: string
): Promise<ServiceResult<PublicUser>> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })
  if (error) return fail("Email o contraseña incorrectos.")
  if (!data.user) return fail("No se pudo iniciar sesión.")

  const perfil = await cargarPerfil(data.user)
  return perfil ? ok(perfil) : fail("No se pudo cargar tu perfil.")
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut()
}

/** RS3.3/RS3.6: usuario autenticado actual (sesión + perfil), o null. */
export async function getCurrentUser(): Promise<PublicUser | null> {
  const { data } = await supabase.auth.getUser()
  if (!data.user) return null
  return cargarPerfil(data.user)
}

/** Suscripción a cambios de sesión (login/logout/refresh). */
export function onAuthChange(callback: () => void): () => void {
  const { data } = supabase.auth.onAuthStateChange(() => callback())
  return () => data.subscription.unsubscribe()
}

export interface ClienteLite {
  id: string
  nombre: string
  creditos: number
}

/** RS4: listado de clientes para el panel admin (RLS permite al admin leer todos). */
export async function listarClientes(): Promise<ClienteLite[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, nombre, creditos")
    .eq("role", "cliente")
    .order("nombre")

  if (error || !data) return []
  return data.map((r) => ({
    id: r.id as string,
    nombre: r.nombre as string,
    creditos: r.creditos as number,
  }))
}

export const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  onAuthChange,
  listarClientes,
}
