import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { MovimientoItem } from "@/components/historial/MovimientoItem"
import { historyService, type TipoMovimiento } from "@/services"
import { useAsync } from "@/hooks/useAsync"
import { DatePicker } from "@/components/ui/date-picker"

type FiltroTipo = "todos" | TipoMovimiento

const OPCIONES: { value: FiltroTipo; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "carga_creditos", label: "Cargas" },
  { value: "inscripcion_sorteo", label: "Inscripciones" },
  { value: "compra_membresia", label: "Membresías" },
  { value: "canje_cupon", label: "Cupones" },
]

export function AdminHistorial() {
  const [tipo, setTipo] = useState<FiltroTipo>("todos")
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")

  const filtro = useMemo(
    () => ({
      tipo: tipo === "todos" ? undefined : tipo,
      desde: desde || null,
      hasta: hasta || null,
    }),
    [tipo, desde, hasta]
  )

  const { data: movimientos, loading } = useAsync(
    () => historyService.listarGlobal(filtro),
    [filtro.tipo, filtro.desde, filtro.hasta]
  )

  function limpiarFiltros() {
    setTipo("todos")
    setDesde("")
    setHasta("")
  }

  const hayFiltros = tipo !== "todos" || desde || hasta

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-lg font-semibold md:text-xl lg:text-2xl">Historial global</h1>
        <p className="text-sm text-muted-foreground">
          Movimientos de la plataforma.
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          {/* Tipo de movimiento */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as FiltroTipo)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPCIONES.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rango de fechas */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Desde</Label>
              <DatePicker
                value={desde}
                onChange={setDesde}
                placeholder="Fecha inicio"
                className="w-full"
                maxDate={hasta || undefined}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Hasta</Label>
              <DatePicker
                value={hasta}
                onChange={setHasta}
                placeholder="Fecha fin"
                className="w-full"
                minDate={desde || undefined}
              />
            </div>
          </div>

          {hayFiltros && (
            <Button
              variant="ghost"
              size="sm"
              onClick={limpiarFiltros}
              className="self-end text-xs"
            >
              Limpiar filtros
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Movimientos
            {movimientos && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({movimientos.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : !movimientos || movimientos.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No hay movimientos para este filtro.
            </p>
          ) : (
            <div className="divide-y px-4">
              {movimientos.map((m) => (
                <MovimientoItem key={m.id} movimiento={m} mostrarUsuario />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
