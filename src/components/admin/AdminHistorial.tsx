import { Loader2 } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MovimientoItem } from "@/components/historial/MovimientoItem"
import { historyService } from "@/services"
import { useAsync } from "@/hooks/useAsync"

export function AdminHistorial() {
  const { data: movimientos, loading } = useAsync(
    () => historyService.listarGlobal(),
    []
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Historial global</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : !movimientos || movimientos.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            Todavía no hay movimientos en la plataforma.
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
  )
}
