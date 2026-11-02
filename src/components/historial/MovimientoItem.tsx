import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import {
  Coins,
  CreditCard,
  Ticket,
  Trophy,
  type LucideIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCreditosSigned } from "@/lib/format"
import type { Movimiento, TipoMovimiento } from "@/services"

interface Meta {
  label: string
  icon: LucideIcon
  badgeClass: string
}

const META: Record<TipoMovimiento, Meta> = {
  compra_membresia: {
    label: "Membresía",
    icon: CreditCard,
    badgeClass: "bg-primary/10 text-primary border-primary/20",
  },
  canje_cupon: {
    label: "Cupón",
    icon: Ticket,
    badgeClass: "bg-accent-cupones/10 text-accent-cupones border-accent-cupones/20",
  },
  inscripcion_sorteo: {
    label: "Sorteo",
    icon: Trophy,
    badgeClass: "bg-accent-sorteos/10 text-accent-sorteos border-accent-sorteos/20",
  },
  carga_creditos: {
    label: "Carga de puntos",
    icon: Coins,
    badgeClass: "bg-success/10 text-success border-success/20",
  },
}

/**
 * Item de movimiento rediseñado con jerarquía visual:
 * 1. Badge de tipo + monto (escaneo rápido)
 * 2. Detalle completo (qué pasó)
 * 3. Fecha/hora prominente + usuario (cuándo y quién)
 */
export function MovimientoItem({
  movimiento,
  mostrarUsuario,
}: {
    movimiento: Movimiento
  mostrarUsuario?: boolean
}) {
  const meta = META[movimiento.tipo]
  const Icon = meta.icon
  const creditos = movimiento.creditos

  // Formato: "30 oct 2026, 1:47 p. m."
  const fechaFormateada = format(
    parseISO(movimiento.fecha),
    "d MMM yyyy, h:mm aa",
    { locale: es }
  )

  return (
    <div className="flex flex-col gap-1 py-3">
      {/* Fila 1: tipo + monto */}
      <div className="flex items-center justify-between gap-2">
        <Badge
          variant="outline"
          className={cn("gap-1 text-xs font-medium", meta.badgeClass)}
        >
          <Icon className="size-3" />
          {meta.label}
        </Badge>
        {typeof creditos === "number" && (
          <span
            className={cn(
              "text-base font-bold tabular-nums",
              creditos >= 0 ? "text-success" : "text-destructive"
            )}
          >
            {formatCreditosSigned(creditos)}
          </span>
        )}
      </div>

      {/* Fila 2: detalle completo (sin truncar) */}
      <p className="text-sm font-medium leading-snug">{movimiento.detalle}</p>

      {/* Fila 3: fecha + usuario */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          {fechaFormateada}
        </p>
        {mostrarUsuario && movimiento.usuarioNombre && (
          <p className="truncate text-xs text-muted-foreground">
            {movimiento.usuarioNombre}
          </p>
        )}
      </div>
    </div>
  )
}
