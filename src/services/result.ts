import type { PostgrestError } from "@supabase/supabase-js"
import type { ServiceResult } from "./types"

export const ok = <T>(data: T): ServiceResult<T> => ({ ok: true, data })
export const fail = (error: string): ServiceResult<never> => ({
  ok: false,
  error,
})

/**
 * Traduce un error de Supabase/Postgres a un mensaje en español para la UI.
 * Las funciones RPC lanzan EXCEPTION con mensajes ya en español (los usamos
 * tal cual); para otros errores damos un mensaje genérico y logueamos el
 * detalle crudo en consola para depurar.
 */
export function toErrorMessage(
  error: PostgrestError | Error | null,
  fallback = "Ocurrió un error. Intentá de nuevo."
): string {
  if (!error) return fallback
  const raw = error.message ?? ""

  // Mensajes de nuestras RPC (raise exception) llegan prefijados por Postgres.
  // Ej: "...: Créditos insuficientes...". Tomamos la última parte legible.
  const match = raw.match(/:\s*([^:]+)$/)
  const message = match ? match[1].trim() : raw.trim()

  if (!message) {
    console.error("Supabase error:", error)
    return fallback
  }
  // De cara al usuario se dice "puntos", no "créditos" (requisito legal).
  // El backend usa "créditos" internamente; traducimos solo el texto visible.
  return message.replace(/créditos/gi, "puntos").replace(/crédito/gi, "punto")
}
