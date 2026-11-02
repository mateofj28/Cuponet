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
import { couponService, type CuponConComercio } from "@/services"
import { useAsync } from "@/hooks/useAsync"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"
import { DatePicker } from "@/components/ui/date-picker"

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
  const { data: cupones, reload } = useAsync(
    () => couponService.listarTodos(),
    []
  )
  const { data: comercios } = useAsync(() => couponService.listarComercios(), [])
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [guardando, setGuardando] = useState(false)

  function abrirNuevo() {
    setEditId(null)
    setForm({ ...emptyForm, comercioId: comercios?.[0]?.id ?? "" })
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

  async function guardar(e: FormEvent) {
    e.preventDefault()
    const payload = {
      titulo: form.titulo,
      comercioId: form.comercioId,
      descripcion: form.descripcion,
      descuento: form.descuento,
      vencimiento: new Date(form.vencimiento).toISOString(),
    }
    setGuardando(true)
    const result = editId
      ? await couponService.actualizar(editId, payload)
      : await couponService.crear(payload)
    setGuardando(false)

    if (result.ok) {
      toast.success(editId ? "Cupón actualizado." : "Cupón creado.")
      setOpen(false)
      reload()
    } else {
      toast.error(result.error)
    }
  }

  async function eliminar(id: string) {
    const result = await couponService.eliminar(id)
    if (result.ok) {
      toast.success("Cupón eliminado.")
      reload()
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
                    {(comercios ?? []).map((c) => (
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
                <DatePicker
                  value={form.vencimiento}
                  onChange={(v) => setForm({ ...form, vencimiento: v })}
                  minDate={new Date().toISOString().split("T")[0]}
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
        {!cupones || cupones.length === 0 ? (
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
              <ConfirmDialog
                trigger={
                  <Button variant="ghost" size="icon" aria-label="Eliminar">
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                }
                title="Eliminar cupón"
                description={`¿Seguro que querés eliminar "${c.titulo}"? Esta acción no se puede deshacer.`}
                confirmLabel="Eliminar"
                destructive
                onConfirm={() => eliminar(c.id)}
              />
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
