import { useEffect, useState } from "react"

interface CountdownProps {
  /** Fecha de cierre en ISO. */
  target: string
  /** Se llama una vez cuando la cuenta llega a cero. */
  onComplete?: () => void
  className?: string
}

function diffParts(targetMs: number) {
  const total = Math.max(0, targetMs - Date.now())
  const dias = Math.floor(total / 86_400_000)
  const horas = Math.floor((total % 86_400_000) / 3_600_000)
  const min = Math.floor((total % 3_600_000) / 60_000)
  const seg = Math.floor((total % 60_000) / 1000)
  return { total, dias, horas, min, seg }
}

const pad = (n: number) => n.toString().padStart(2, "0")

/** Cuenta regresiva en vivo hasta la fecha de cierre de un sorteo. */
export function Countdown({ target, onComplete, className }: CountdownProps) {
  const targetMs = new Date(target).getTime()
  const [parts, setParts] = useState(() => diffParts(targetMs))

  useEffect(() => {
    if (parts.total <= 0) {
      onComplete?.()
      return
    }
    const timer = setInterval(() => {
      const next = diffParts(targetMs)
      setParts(next)
      if (next.total <= 0) {
        clearInterval(timer)
        onComplete?.()
      }
    }, 1000)
    return () => clearInterval(timer)
    // targetMs identifica el sorteo; onComplete es estable por parte del caller
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetMs])

  if (parts.total <= 0) {
    return <span className={className}>Cerrado</span>
  }

  return (
    <span className={className}>
      {parts.dias > 0 && `${parts.dias}d `}
      {pad(parts.horas)}:{pad(parts.min)}:{pad(parts.seg)}
    </span>
  )
}
