import { useCallback, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Clock, Coins, Gift, Hash } from "lucide-react"
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
import { raffleService } from "@/services"

export function SorteoDetalle() {
  const { id } = useParams<{ id: string }>()
  const { user, refreshUser } = useAuth()

  // version fuerza re-lectura del servicio tras inscribir o cerrar
  const [version, setVersion] = useState(0)
  const refrescar = useCallback(() => setVersion((v) => v + 1), [])

  // `version` fuerza la re-lectura del servicio mutable (no reactivo) tras
  // inscribir o al cerrar el sorteo; por eso está en las dependencias.
  const sorteo = useMemo(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    () => (id ? raffleService.getById(id) : null),
    [id, version]
  )
  const inscripcion = useMemo(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    () => (user && id ? raffleService.getInscripcion(user.id, id) : null),
    [user, id, version]
  )

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

  function inscribir() {
    if (!user || !sorteo) return
    const result = raffleService.inscribir(user.id, sorteo.id)
    if (result.ok) {
      refreshUser()
      refrescar()
      const ultimo = result.data.numeros[result.data.numeros.length - 1]
      toast.success(`¡Anotado! Tu número es el ${ultimo}.`)
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
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
            <Badge variant={cerrado ? "outline" : "default"}>
              {cerrado ? "Cerrado" : "Activo"}
            </Badge>
          </div>
          <CardDescription className="flex items-center gap-1">
            <Clock className="size-3.5" />
            <Countdown target={sorteo.cierre} onComplete={refrescar} />
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
              {sorteo.costoCreditos}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Números en juego</span>
            <span>{sorteo.numerosEnJuego}</span>
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
          <Button className="w-full" onClick={inscribir} disabled={cerrado}>
            {cerrado
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
