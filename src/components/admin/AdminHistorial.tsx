import { useState } from "react"
import { Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MovimientoItem } from "@/components/historial/MovimientoItem"
import { historyService, type TipoMovimiento } from "@/services"
import { useAsync } from "@/hooks/useAsync"

type Filtro = "todos" | TipoMovimiento

const OPCIONES: { value: Filtro; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "carga_creditos", label: "Cargas" },
  { value: "inscripcion_sorteo", label: "Inscripciones" },
  { value: "compra_membresia", label: "Membresías" },
  { value: "canje_cupon", label: "Cupones" },
]

export function AdminHistorial() {
  const [filtro, setFiltro] = useState<Filtro>("todos")

  const { data: movimientos, loading } = useAsync(
    () =>
      historyService.listarGlobal(
        filtro === "todos" ? undefined : filtro
      ),
    [filtro]
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">Historial global</h1>
          <p className="text-sm text-muted-foreground">
            Movimientos de la plataforma.
          </p>
        </div>
        <Select value={filtro} onValueChange={(v) => setFiltro(v as Filtro)}>
          <SelectTrigger className="w-40">
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Movimientos</CardTitle>
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
