import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MovimientoItem } from "@/components/historial/MovimientoItem"
import { historyService } from "@/services"

export function AdminHistorial() {
  const movimientos = historyService.listarGlobal()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Historial global</CardTitle>
      </CardHeader>
      <CardContent className="divide-y p-0">
        {movimientos.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            Todavía no hay movimientos en la plataforma.
          </p>
        ) : (
          <div className="px-4">
            {movimientos.map((m) => (
              <MovimientoItem key={m.id} movimiento={m} mostrarUsuario />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
