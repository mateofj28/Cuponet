// Feedback sonoro sintetizado con Web Audio API (sin archivos de audio).
// Suena solo en acciones importantes, con tonos distintos para éxito y error.
// Respeta la preferencia de silencio del usuario (persistida en localStorage).

const STORAGE_KEY = "cuponet.sound"

let audioCtx: AudioContext | null = null
let unlocked = false

function createContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  if (!Ctor) return null // navegador sin Web Audio: degradación silenciosa
  if (!audioCtx) audioCtx = new Ctor()
  return audioCtx
}

/** Retorna el contexto (ya debería estar desbloqueado por unlockAudio). */
function getContext(): AudioContext | null {
  const ctx = createContext()
  if (ctx && ctx.state === "suspended") void ctx.resume()
  return ctx
}

/**
 * Desbloquea el audio dentro de un gesto del usuario (clic/touch).
 * iOS/Safari exige crear + resumir el AudioContext y reproducir un buffer
 * mudo durante la primera interacción; recién ahí habilita el audio para
 * el resto de la sesión. Debe llamarse desde un listener de interacción.
 */
export function unlockAudio(): void {
  if (unlocked) return
  const ctx = createContext()
  if (!ctx) return

  void ctx.resume()

  // Buffer de silencio: "despierta" el pipeline de audio en iOS.
  const buffer = ctx.createBuffer(1, 1, 22050)
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  source.start(0)

  unlocked = true
}

/** ¿El sonido está habilitado? (default: habilitado). */
export function isSoundEnabled(): boolean {
  if (typeof localStorage === "undefined") return true
  return localStorage.getItem(STORAGE_KEY) !== "off"
}

/** Activa o silencia el sonido y persiste la preferencia. */
export function setSoundEnabled(enabled: boolean): void {
  if (typeof localStorage === "undefined") return
  localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off")
}

/**
 * Reproduce una secuencia de tonos cortos con envolvente suave.
 * freqs: frecuencias en Hz; step: separación entre tonos en segundos.
 */
function playTones(
  freqs: number[],
  { type = "sine", step = 0.09, duration = 0.12, volume = 0.05 } = {}
): void {
  const ctx = getContext()
  if (!ctx) return

  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const start = ctx.currentTime + i * step

    osc.type = type as OscillatorType
    osc.frequency.value = freq

    // Envolvente: ataque rápido + caída, para un sonido breve y sutil.
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(volume, start + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(start)
    osc.stop(start + duration)
  })
}

/** Sonido de éxito: dos tonos ascendentes agradables. */
export function playSuccess(): void {
  if (!isSoundEnabled()) return
  playTones([660, 880], { type: "sine", step: 0.1, duration: 0.14 })
}

/** Sonido de error: un tono grave y seco. */
export function playError(): void {
  if (!isSoundEnabled()) return
  playTones([180], { type: "triangle", step: 0, duration: 0.22, volume: 0.06 })
}
