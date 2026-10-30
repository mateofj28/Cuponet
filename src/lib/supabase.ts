import { createClient } from "@supabase/supabase-js"

/**
 * Cliente único de Supabase para toda la app.
 * Las credenciales se leen de variables de entorno (ver steering `supabase`):
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 *
 * Fail-fast: si falta alguna, cortamos el arranque con un error claro en vez
 * de fallar más tarde con mensajes confusos del SDK.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan variables de entorno de Supabase. Definí VITE_SUPABASE_URL y " +
      "VITE_SUPABASE_ANON_KEY en tu archivo .env (ver .env.example)."
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
