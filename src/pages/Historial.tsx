import { History as HistoryIcon, Loader2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent } from "@/components/ui/card"
import { MovimientoItem } from "@/components/historial/MovimientoItem"
import { historyService } from "@/services"
import { useAsync } from "@/hooks/useAsync"

export function Historial() {
  const { user } = useAuth()
  const { data: movimientos, loading } = useAsync(
    () => (user ? historyService.listarPorUsuario(user.id) : Promise.resolve([])),
    [user?.id]
  )

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-lg font-semibold md:text-xl">Historial</h1>
        <p className="text-sm text-muted-foreground">
          Tus movimientos más recientes.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : !movimientos || movimientos.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <HistoryIcon className="size-8" />
          <p className="text-sm">Todavía no tenés movimientos.</p>
        </div>
      ) : (
        <Card>
          <CardContent className="divide-y">
            {movimientos.map((m) => (
              <MovimientoItem key={m.id} movimiento={m} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
