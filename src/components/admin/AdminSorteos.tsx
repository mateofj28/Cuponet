import { useState, type FormEvent } from "react"
import { format, parseISO } from "date-fns"
import { Lock, Pencil, Plus } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { raffleService, type Sorteo } from "@/services"
import { useAsync } from "@/hooks/useAsync"

const toDateTimeInput = (iso: string) =>
  format(parseISO(iso), "yyyy-MM-dd'T'HH:mm")

interface FormState {
  titulo: string
  productoPrincipal: string
  productosSecundarios: string
  cierre: string
  numerosEnJuego: string
  costoCreditos: string
}

const emptyForm = (): FormState => ({
  titulo: "",
  productoPrincipal: "",
  productosSecundarios: "",
  cierre: toDateTimeInput(new Date(Date.now() + 86_400_000).toISOString()),
  numerosEnJuego: "100",
  costoCreditos: "50",
})

export function AdminSorteos() {
  const { data: sorteos, reload } = useAsync(
    () => raffleService.listarTodos(),
    []
  )
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [guardando, setGuardando] = useState(false)

  function abrirNuevo() {
    setEditId(null)
    setForm(emptyForm())
    setOpen(true)
  }

  function abrirEditar(s: Sorteo) {
    setEditId(s.id)
    setForm({
      titulo: s.titulo,
      productoPrincipal: s.productoPrincipal,
      productosSecundarios: s.productosSecundarios.join(", "),
      cierre: toDateTimeInput(s.cierre),
      numerosEnJuego: String(s.numerosEnJuego),
      costoCreditos: String(s.costoCreditos),
    })
    setOpen(true)
  }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    const payload = {
      titulo: form.titulo,
      productoPrincipal: form.productoPrincipal,
      productosSecundarios: form.productosSecundarios
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      cierre: new Date(form.cierre).toISOString(),
      numerosEnJuego: Number(form.numerosEnJuego) || 0,
      costoCreditos: Number(form.costoCreditos) || 0,
    }
    setGuardando(true)
    const result = editId
      ? await raffleService.actualizar(editId, payload)
      : await raffleService.crear(payload)
    setGuardando(false)

    if (result.ok) {
      toast.success(editId ? "Sorteo actualizado." : "Sorteo creado.")
      setOpen(false)
      reload()
    } else {
      toast.error(result.error)
    }
  }

  async function cerrar(id: string) {
    const result = await raffleService.cerrar(id)
    if (result.ok) {
      toast.success("Sorteo cerrado.")
      reload()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Sorteos</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={abrirNuevo}>
              <Plus className="size-4" />
              Nuevo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editId ? "Editar sorteo" : "Nuevo sorteo"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={guardar} className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="s-titulo">Título</Label>
                <Input
                  id="s-titulo"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="s-prod">Producto principal</Label>
                <Input
                  id="s-prod"
                  value={form.productoPrincipal}
                  onChange={(e) =>
                    setForm({ ...form, productoPrincipal: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="s-sec">Productos secundarios</Label>
                <Input
                  id="s-sec"
                  placeholder="Separados por coma"
                  value={form.productosSecundarios}
                  onChange={(e) =>
                    setForm({ ...form, productosSecundarios: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-3">
                <div className="flex flex-1 flex-col gap-2">
                  <Label htmlFor="s-nums">Números</Label>
                  <Input
                    id="s-nums"
                    type="number"
                    min={1}
                    value={form.numerosEnJuego}
                    onChange={(e) =>
                      setForm({ ...form, numerosEnJuego: e.target.value })
                    }
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <Label htmlFor="s-costo">Costo</Label>
                  <Input
                    id="s-costo"
                    type="number"
                    min={0}
                    value={form.costoCreditos}
                    onChange={(e) =>
                      setForm({ ...form, costoCreditos: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="s-cierre">Cierre</Label>
                <Input
                  id="s-cierre"
                  type="datetime-local"
                  value={form.cierre}
                  onChange={(e) => setForm({ ...form, cierre: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="divide-y p-0">
        {!sorteos || sorteos.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No hay sorteos cargados.
          </p>
        ) : (
          sorteos.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{s.titulo}</p>
                <p className="text-xs text-muted-foreground">
                  {s.productoPrincipal}
                </p>
              </div>
              <Badge variant={s.estado === "activo" ? "default" : "outline"}>
                {s.estado}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => abrirEditar(s)}
                aria-label="Editar"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => cerrar(s.id)}
                disabled={s.estado === "cerrado"}
                aria-label="Cerrar sorteo"
              >
                <Lock className="size-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
