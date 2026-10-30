import { Loader2 } from "lucide-react"

/** Loader a pantalla completa para estados de carga de sesión. */
export function FullScreenLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
}
