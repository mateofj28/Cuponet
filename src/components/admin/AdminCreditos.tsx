import { useState, type FormEvent } from "react"
import { Coins } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { creditService, type UsuarioAdmin } from "@/services"
import { playError, playSuccess } from "@/lib/sound"
import { UserSearch } from "@/components/admin/UserSearch"

export function AdminCreditos() {
  const [cliente, setCliente] = useState<UsuarioAdmin | null>(null)
  const [monto, setMonto] = useState("")
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const cantidad = Number(monto)
    if (!cliente) {
      toast.error("Buscá y elegí un cliente.")
      return
    }
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      toast.error("Ingresá un monto válido mayor a 0.")
      return
    }

    setCargando(true)
    const result = await creditService.cargar(cliente.id, cantidad)
    setCargando(false)
    if (result.ok) {
      playSuccess()
      toast.success("Puntos cargados correctamente.")
      setMonto("")
      setCliente(null)
    } else {
      playError()
      toast.error(result.error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Coins className="size-4" />
          Cargar puntos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Cliente</Label>
            <UserSearch value={cliente} onSelect={setCliente} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="monto">Monto</Label>
            <Input
              id="monto"
              type="number"
              min={1}
              placeholder="100"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={cargando}>
            {cargando ? "Cargando..." : "Cargar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
