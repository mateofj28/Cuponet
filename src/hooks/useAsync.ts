import { useCallback, useEffect, useState } from "react"

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
  /** Vuelve a ejecutar la función (p. ej. tras una mutación). */
  reload: () => void
}

/**
 * Ejecuta una función async al montar (y cuando cambian las `deps`),
 * exponiendo estado de carga/error de forma uniforme para las páginas.
 *
 * La función debe devolver los datos ya resueltos (o lanzar / devolver un
 * ServiceResult manejado por el caller). Acá asumimos que resuelve `T`.
 */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: unknown[] = []
): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    let cancelado = false
    setLoading(true)
    setError(null)

    fn()
      .then((result) => {
        if (!cancelado) setData(result)
      })
      .catch((e: unknown) => {
        if (!cancelado) {
          setError(e instanceof Error ? e.message : "Error inesperado.")
        }
      })
      .finally(() => {
        if (!cancelado) setLoading(false)
      })

    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce])

  return { data, loading, error, reload }
}
