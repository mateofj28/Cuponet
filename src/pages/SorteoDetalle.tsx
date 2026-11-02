import { useState } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Clock, Coins, Gift, Hash, Loader2 } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import { Countdown } from "@/components/sorteos/Countdown"
import { raffleService, type Inscripcion, type Sorteo } from "@/services"
import { useAsync } from "@/hooks/useAsync"
import { badgeSuccess } from "@/lib/statusBadge"
import { formatCreditos } from "@/lib/format"
import { playError, playSuccess } from "@/lib/sound"

interface DetalleData {
  sorteo: Sorteo | null
  inscripcion: Inscripcion | null
}

export function SorteoDetalle() {
  const { id } = useParams<{ id: string }>()
  const { user, refreshUser } = useAuth()
  const [inscribiendo, setInscribiendo] = useState(false)

  const { data, loading, reload } = useAsync<DetalleData>(async () => {
    if (!id) return { sorteo: null, inscripcion: null }
    const [sorteo, inscripcion] = await Promise.all([
      raffleService.getById(id),
      user ? raffleService.getInscripcion(user.id, id) : Promise.resolve(null),
    ])
    return { sorteo, inscripcion }
  }, [id, user?.id])

  if (loading) {
    return (
      <div className="flex justify-center p-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const sorteo = data?.sorteo ?? null
  const inscripcion = data?.inscripcion ?? null

  if (!sorteo) {
    return (
      <div className="flex flex-col items-center gap-4 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No encontramos ese sorteo.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link to="/sorteos">Volver a sorteos</Link>
        </Button>
      </div>
    )
  }

  const cerrado = sorteo.estado === "cerrado"

  async function inscribir() {
    if (!sorteo) return
    setInscribiendo(true)
    const result = await raffleService.inscribir(sorteo.id)
    setInscribiendo(false)
    if (result.ok) {
      await refreshUser()
      reload()
      playSuccess()
      toast.success(`¡Anotado! Tu número es el ${result.data}.`)
    } else {
      playError()
      toast.error(result.error)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">
      <Button asChild variant="ghost" size="sm" className="w-fit px-0">
        <Link to="/sorteos">
          <ArrowLeft className="size-4" />
          Sorteos
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle>{sorteo.titulo}</CardTitle>
            <Badge
              variant={cerrado ? "outline" : "default"}
              className={cerrado ? undefined : badgeSuccess}
            >
              {cerrado ? "Cerrado" : "Activo"}
            </Badge>
          </div>
          <CardDescription className="flex items-center gap-1">
            <Clock className="size-3.5" />
            <Countdown target={sorteo.cierre} onComplete={reload} />
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Gift className="size-4 text-primary" />
            <span className="font-medium">{sorteo.productoPrincipal}</span>
          </div>
          {sorteo.productosSecundarios.length > 0 && (
            <div className="text-muted-foreground">
              <p className="mb-1 text-xs uppercase tracking-wide">
                También se sortean
              </p>
              <ul className="list-inside list-disc">
                {sorteo.productosSecundarios.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Costo por número</span>
            <span className="flex items-center gap-1 font-medium">
              <Coins className="size-4" />
              {formatCreditos(sorteo.costoCreditos)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Números en juego</span>
            <span>{sorteo.numerosEnJuego}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Se anuncia el</span>
            <span className="font-medium">
              {format(parseISO(sorteo.fechaSorteo), "d 'de' MMMM yyyy", {
                locale: es,
              })}
            </span>
          </div>

          {inscripcion && inscripcion.numeros.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="mb-1 flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                  <Hash className="size-3.5" />
                  Tus números
                </p>
                <div className="flex flex-wrap gap-2">
                  {inscripcion.numeros.map((n) => (
                    <Badge key={n} variant="secondary">
                      {n}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter>
          <Button
            className="w-full"
            onClick={inscribir}
            disabled={cerrado || inscribiendo}
          >
            {inscribiendo
              ? "Procesando..."
              : cerrado
                ? "Sorteo cerrado"
                : inscripcion
                  ? "Sumar otro número"
                  : "Anotarme"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
