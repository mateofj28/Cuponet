import { Link } from "react-router-dom"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import {
  ArrowRight,
  Coins,
  Megaphone,
  Ticket,
  Trophy,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { badgeSuccess } from "@/lib/statusBadge"
import { formatCreditos } from "@/lib/format"
import type { PlanId } from "@/services"

const NOMBRE_PLAN: Record<PlanId, string> = {
  plan1: "Plan 1",
  plan3: "Plan 3",
  black: "Plan Black",
}

const accesos = [
  {
    to: "/cupones",
    titulo: "Cupones",
    descripcion: "Descuentos de comercios asociados",
    icon: Ticket,
    color: "text-accent-cupones",
  },
  {
    to: "/sorteos",
    titulo: "Sorteos",
    descripcion: "Participá y ganá premios",
    icon: Trophy,
    color: "text-accent-sorteos",
  },
] as const

export function Home() {
  const { user, membresiaActiva } = useAuth()

  const planNombre = user?.membresia
    ? NOMBRE_PLAN[user.membresia.planId]
    : null

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">
      {/* Estado de membresía */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Tu membresía</CardTitle>
            <Badge
              variant={membresiaActiva ? "default" : "outline"}
              className={membresiaActiva ? badgeSuccess : undefined}
            >
              {membresiaActiva ? "Activa" : "Inactiva"}
            </Badge>
          </div>
          <CardDescription>
            {membresiaActiva && planNombre && user?.membresia ? (
              <>
                {planNombre} · vence el{" "}
                {format(parseISO(user.membresia.expiracion), "d 'de' MMMM yyyy", {
                  locale: es,
                })}
              </>
            ) : (
              "Necesitás una membresía activa para canjear cupones y participar en sorteos."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Coins className="size-4 text-muted-foreground" />
            <span className="font-medium">
              {formatCreditos(user?.creditos ?? 0)}
            </span>
            <span className="text-muted-foreground">puntos</span>
          </div>
          <Button asChild size="sm" variant={membresiaActiva ? "outline" : "default"}>
            <Link to="/membresia">
              {membresiaActiva ? "Gestionar" : "Activar membresía"}
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Accesos principales */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {accesos.map(({ to, titulo, descripcion, icon: Icon, color }) => (
          <Link key={to} to={to} className="group">
            <Card className="h-full transition-colors group-hover:border-primary">
              <CardHeader>
                <Icon className={`size-6 ${color}`} />
                <CardTitle className="text-base">{titulo}</CardTitle>
                <CardDescription className="text-xs">
                  {descripcion}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Publicidad */}
      <Card className="bg-muted/40">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Megaphone className="size-5 text-primary" />
            <CardTitle className="text-base">Publicidad</CardTitle>
          </div>
          <CardDescription>
            Espacio para novedades y promociones destacadas de los comercios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="link" className="h-auto p-0" asChild>
            <Link to="/cupones">
              Ver cupones destacados
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
