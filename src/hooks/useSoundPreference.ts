import { useCallback, useState } from "react"
import { isSoundEnabled, setSoundEnabled } from "@/lib/sound"

/** Estado reactivo de la preferencia de sonido (persistida en localStorage). */
export function useSoundPreference() {
  const [enabled, setEnabled] = useState(() => isSoundEnabled())

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
      setSoundEnabled(next)
      return next
    })
  }, [])

  return { enabled, toggle }
}
