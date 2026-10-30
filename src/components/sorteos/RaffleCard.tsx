import { Link } from "react-router-dom"
import { Clock, Coins, Gift } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Countdown } from "@/components/sorteos/Countdown"
import { formatCreditos } from "@/lib/format"
import type { Sorteo } from "@/services"

export function RaffleCard({ sorteo }: { sorteo: Sorteo }) {
  return (
    <Link to={`/sorteos/${sorteo.id}`} className="group">
      <Card className="transition-colors group-hover:border-primary">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base">{sorteo.titulo}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Gift className="size-3.5 text-accent-sorteos" />
                {sorteo.productoPrincipal}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Coins className="size-3.5" />
              {formatCreditos(sorteo.costoCreditos)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            <Countdown target={sorteo.cierre} />
          </span>
          <span>{sorteo.numerosEnJuego} números en juego</span>
        </CardContent>
      </Card>
    </Link>
  )
}
