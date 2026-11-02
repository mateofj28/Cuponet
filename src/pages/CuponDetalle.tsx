import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { format, isAfter, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Store,
} from "lucide-react"
import { toast } from "sonner"
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
import { Separator } from "@/components/ui/separator"
import { couponService } from "@/services"
import { useAsync } from "@/hooks/useAsync"
import { playError, playSuccess } from "@/lib/sound"

export function CuponDetalle() {
  const { id } = useParams<{ id: string }>()
  const { data: cupon, loading } = useAsync(
    () => (id ? couponService.getById(id) : Promise.resolve(null)),
    [id]
  )
  const [canjeado, setCanjeado] = useState(false)
  const [canjeando, setCanjeando] = useState(false)

  const vencido = useMemo(
    () => (cupon ? !isAfter(parseISO(cupon.vencimiento), new Date()) : false),
    [cupon]
  )

  if (loading) {
    return (
      <div className="flex justify-center p-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!cupon) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No encontramos ese cupón.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link to="/cupones">Volver a cupones</Link>
        </Button>
      </div>
    )
  }

  async function canjear() {
    if (!cupon) return
    setCanjeando(true)
    const result = await couponService.canjear(cupon.id)
    setCanjeando(false)
    if (result.ok) {
      setCanjeado(true)
      playSuccess()
      toast.success("¡Cupón canjeado! Mostralo en el comercio.")
    } else {
      playError()
      toast.error(result.error)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">
      <Button asChild variant="ghost" size="sm" className="w-fit px-0">
        <Link to="/cupones">
          <ArrowLeft className="size-4" />
          Cupones
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle>{cupon.titulo}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Store className="size-3.5" />
                {cupon.comercio?.nombre ?? "Comercio"}
              </CardDescription>
            </div>
            <Badge variant={vencido ? "outline" : "secondary"}>
              {cupon.descuento}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 text-sm">
          <p>{cupon.descripcion}</p>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Vencimiento</span>
            <span className={vencido ? "text-destructive" : undefined}>
              {format(parseISO(cupon.vencimiento), "d 'de' MMMM yyyy", {
                locale: es,
              })}
              {vencido && " (vencido)"}
            </span>
          </div>
          {cupon.comercio?.instagramUrl && (
            <a
              href={cupon.comercio.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary underline"
            >
              <ExternalLink className="size-4" />
              Ver en Instagram
            </a>
          )}
        </CardContent>

        <CardFooter>
          {canjeado ? (
            <Button className="w-full" variant="outline" disabled>
              <CheckCircle2 className="size-4" />
              Canjeado
            </Button>
          ) : (
              <Button
                className="w-full"
                onClick={canjear}
                disabled={vencido || canjeando}
              >
                {canjeando
                  ? "Canjeando..."
                  : vencido
                    ? "Cupón vencido"
                    : "Canjear cupón"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
