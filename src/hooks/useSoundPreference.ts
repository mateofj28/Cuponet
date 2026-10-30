import { useCallback, useState } from "react"
import { isSoundEnabled, setSoundEnabled, unlockAudio } from "@/lib/sound"

/** Estado reactivo de la preferencia de sonido (persistida en localStorage). */
export function useSoundPreference() {
  const [enabled, setEnabled] = useState(() => isSoundEnabled())

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
      setSoundEnabled(next)
      // Al activar desde un gesto directo, desbloqueamos el audio (iOS).
      if (next) unlockAudio()
      return next
    })
  }, [])

  return { enabled, toggle }
}
