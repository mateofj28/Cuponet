import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Check, Coins, Crown } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { membershipService, PLANES, type PlanId } from "@/services"

export function Membresia() {
  const { user, membresiaActiva, refreshUser } = useAuth()

  const planActual = user?.membresia?.planId ?? null
  const saldo = user?.creditos ?? 0

  function comprar(planId: PlanId) {
    if (!user) return
    const result = membershipService.comprarPlan(user.id, planId)
    if (result.ok) {
      refreshUser()
      const plan = PLANES.find((p) => p.id === planId)
      toast.success(`¡Membresía ${plan?.nombre} activada!`)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Estado actual */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Estado</CardTitle>
            <Badge variant={membresiaActiva ? "default" : "outline"}>
              {membresiaActiva ? "Activa" : "Sin membresía"}
            </Badge>
          </div>
          <CardDescription>
            {membresiaActiva && user?.membresia ? (
              <>
                Vence el{" "}
                {format(parseISO(user.membresia.expiracion), "d 'de' MMMM yyyy", {
                  locale: es,
                })}
              </>
            ) : (
              "Activá un plan para acceder a cupones y sorteos."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-2 text-sm">
          <Coins className="size-4 text-muted-foreground" />
          <span className="font-medium">{saldo}</span>
          <span className="text-muted-foreground">créditos disponibles</span>
        </CardContent>
      </Card>

      {/* Planes */}
      <div className="flex flex-col gap-3">
        {PLANES.map((plan) => {
          const esActual = planActual === plan.id && membresiaActiva
          const esBlack = plan.id === "black"
          const saldoInsuficiente = saldo < plan.costoCreditos

          return (
            <Card
              key={plan.id}
              className={esBlack ? "border-primary" : undefined}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {esBlack && <Crown className="size-4 text-primary" />}
                    {plan.nombre}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-sm font-semibold">
                    <Coins className="size-4" />
                    {plan.costoCreditos}
                  </div>
                </div>
                <CardDescription>
                  Acceso completo por{" "}
                  {plan.meses === 1 ? "1 mes" : `${plan.meses} meses`}.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                {esActual ? (
                  <Button variant="outline" className="w-full" disabled>
                    <Check className="size-4" />
                    Plan actual
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={esBlack ? "default" : "outline"}
                    disabled={saldoInsuficiente}
                    onClick={() => comprar(plan.id)}
                  >
                    {saldoInsuficiente
                      ? `Faltan ${plan.costoCreditos - saldo} créditos`
                      : membresiaActiva
                        ? "Cambiar a este plan"
                        : "Activar"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Los créditos los carga un administrador. La membresía se paga con
        créditos.
      </p>
    </div>
  )
}
