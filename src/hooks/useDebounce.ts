import { useEffect, useState } from "react"

/** Devuelve el valor con un retardo; útil para no disparar búsquedas en cada tecla. */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])

  return debounced
}
