import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import {
  Coins,
  CreditCard,
  Ticket,
  Trophy,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Movimiento, TipoMovimiento } from "@/services"

const META: Record<TipoMovimiento, { label: string; icon: LucideIcon }> = {
  compra_membresia: { label: "Membresía", icon: CreditCard },
  canje_cupon: { label: "Cupón", icon: Ticket },
  inscripcion_sorteo: { label: "Sorteo", icon: Trophy },
  carga_creditos: { label: "Carga de créditos", icon: Coins },
}

export function MovimientoItem({
  movimiento,
  mostrarUsuario,
}: {
  movimiento: Movimiento
  /** Si es true, antepone el id de usuario (uso en historial global admin). */
  mostrarUsuario?: boolean
}) {
  const meta = META[movimiento.tipo]
  const Icon = meta.icon
  const creditos = movimiento.creditos

  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{movimiento.detalle}</p>
        <p className="text-xs text-muted-foreground">
          {meta.label} ·{" "}
          {format(parseISO(movimiento.fecha), "d MMM yyyy, HH:mm", {
            locale: es,
          })}
          {mostrarUsuario && ` · ${movimiento.userId}`}
        </p>
      </div>
      {typeof creditos === "number" && (
        <span
          className={cn(
            "shrink-0 text-sm font-semibold tabular-nums",
            creditos >= 0 ? "text-emerald-600" : "text-destructive"
          )}
        >
          {creditos >= 0 ? "+" : ""}
          {creditos}
        </span>
      )}
    </div>
  )
}
