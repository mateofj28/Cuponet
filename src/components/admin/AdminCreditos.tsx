import { useState, type FormEvent } from "react"
import { Coins } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
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

export function AdminCreditos() {
  const { user, refreshUser } = useAuth()
  const [clientes, setClientes] = useState(() => authService.listarClientes())
  const [targetId, setTargetId] = useState("")
  const [monto, setMonto] = useState("")

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return

    const cantidad = Number(monto)
    if (!targetId) {
      toast.error("Elegí un cliente.")
      return
    }
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      toast.error("Ingresá un monto válido mayor a 0.")
      return
    }

    const result = creditService.cargar(user.id, targetId, cantidad)
    if (result.ok) {
      toast.success(`Créditos cargados. Nuevo saldo: ${result.data}.`)
      setMonto("")
      setClientes(authService.listarClientes())
      if (targetId === user.id) refreshUser()
    } else {
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
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre} · {c.creditos} créditos
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
          <Button type="submit">Cargar</Button>
        </form>
      </CardContent>
    </Card>
  )
}
