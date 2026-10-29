import { useState, type FormEvent } from "react"
import { format, parseISO } from "date-fns"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { couponService } from "@/services"
import type { CuponConComercio } from "@/services/coupon.service"

const toDateInput = (iso: string) => format(parseISO(iso), "yyyy-MM-dd")

interface FormState {
  titulo: string
  comercioId: string
  descripcion: string
  descuento: string
  vencimiento: string
}

const emptyForm: FormState = {
  titulo: "",
  comercioId: "",
  descripcion: "",
  descuento: "",
  vencimiento: toDateInput(new Date().toISOString()),
}

export function AdminCupones() {
  const [cupones, setCupones] = useState(() => couponService.listarTodos())
  const comercios = couponService.listarComercios()
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const refrescar = () => setCupones(couponService.listarTodos())

  function abrirNuevo() {
    setEditId(null)
    setForm({ ...emptyForm, comercioId: comercios[0]?.id ?? "" })
    setOpen(true)
  }

  function abrirEditar(cupon: CuponConComercio) {
    setEditId(cupon.id)
    setForm({
      titulo: cupon.titulo,
      comercioId: cupon.comercioId,
      descripcion: cupon.descripcion,
      descuento: cupon.descuento,
      vencimiento: toDateInput(cupon.vencimiento),
    })
    setOpen(true)
  }

  function guardar(e: FormEvent) {
    e.preventDefault()
    const payload = {
      titulo: form.titulo,
      comercioId: form.comercioId,
      descripcion: form.descripcion,
      descuento: form.descuento,
      vencimiento: new Date(form.vencimiento).toISOString(),
    }
    const result = editId
      ? couponService.actualizar(editId, payload)
      : couponService.crear(payload)

    if (result.ok) {
      toast.success(editId ? "Cupón actualizado." : "Cupón creado.")
      setOpen(false)
      refrescar()
    } else {
      toast.error(result.error)
    }
  }

  function eliminar(id: string) {
    const result = couponService.eliminar(id)
    if (result.ok) {
      toast.success("Cupón eliminado.")
      refrescar()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Cupones</CardTitle>
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
                {editId ? "Editar cupón" : "Nuevo cupón"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={guardar} className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="comercio">Comercio</Label>
                <Select
                  value={form.comercioId}
                  onValueChange={(v) => setForm({ ...form, comercioId: v })}
                >
                  <SelectTrigger id="comercio">
                    <SelectValue placeholder="Elegí un comercio" />
                  </SelectTrigger>
                  <SelectContent>
                    {comercios.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="descuento">Descuento</Label>
                <Input
                  id="descuento"
                  placeholder="30%"
                  value={form.descuento}
                  onChange={(e) =>
                    setForm({ ...form, descuento: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm({ ...form, descripcion: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="venc">Vencimiento</Label>
                <Input
                  id="venc"
                  type="date"
                  value={form.vencimiento}
                  onChange={(e) =>
                    setForm({ ...form, vencimiento: e.target.value })
                  }
                />
              </div>
              <DialogFooter>
                <Button type="submit">Guardar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="divide-y p-0">
        {cupones.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No hay cupones cargados.
          </p>
        ) : (
          cupones.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.titulo}</p>
                <p className="text-xs text-muted-foreground">
                  {c.comercio?.nombre} · {c.descuento}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => abrirEditar(c)}
                aria-label="Editar"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => eliminar(c.id)}
                aria-label="Eliminar"
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
