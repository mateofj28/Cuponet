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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { authService, creditService } from "@/services"
import { useAsync } from "@/hooks/useAsync"
import { formatCreditos } from "@/lib/format"
import { playError, playSuccess } from "@/lib/sound"

export function AdminCreditos() {
  const { data: clientes, reload } = useAsync(
    () => authService.listarClientes(),
    []
  )
  const [targetId, setTargetId] = useState("")
  const [monto, setMonto] = useState("")
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const cantidad = Number(monto)
    if (!targetId) {
      toast.error("Elegí un cliente.")
      return
    }
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      toast.error("Ingresá un monto válido mayor a 0.")
      return
    }

    setCargando(true)
    const result = await creditService.cargar(targetId, cantidad)
    setCargando(false)
    if (result.ok) {
      playSuccess()
      toast.success("Créditos cargados correctamente.")
      setMonto("")
      reload()
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
          Cargar créditos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="cliente">Cliente</Label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger id="cliente">
                <SelectValue placeholder="Elegí un cliente" />
              </SelectTrigger>
              <SelectContent>
                {(clientes ?? []).map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre} · {formatCreditos(c.creditos)} créditos
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
