import { useState, type FormEvent } from "react"
import { Loader2, Pencil, Plus, Power, Store, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { comercioService, type Comercio } from "@/services"
import { useAsync } from "@/hooks/useAsync"
import { badgeSuccess } from "@/lib/statusBadge"
import { ConfirmDialog } from "@/components/admin/ConfirmDialog"

interface FormState {
  nombre: string
  descripcion: string
  direccion: string
  telefono: string
  email: string
  instagramUrl: string
}

const emptyForm: FormState = {
  nombre: "",
  descripcion: "",
  direccion: "",
  telefono: "",
  email: "",
  instagramUrl: "",
}

export function AdminComercios() {
  const { data: comercios, loading, reload } = useAsync(
    () => comercioService.listar(),
    []
  )
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [guardando, setGuardando] = useState(false)

  function abrirNuevo() {
    setEditId(null)
    setForm(emptyForm)
    setOpen(true)
  }

  function abrirEditar(c: Comercio) {
    setEditId(c.id)
    setForm({
      nombre: c.nombre,
      descripcion: c.descripcion,
      direccion: c.direccion ?? "",
      telefono: c.telefono ?? "",
      email: c.email ?? "",
      instagramUrl: c.instagramUrl,
    })
    setOpen(true)
  }

  async function guardar(e: FormEvent) {
    e.preventDefault()
    if (!form.nombre.trim()) {
      toast.error("El nombre es obligatorio.")
      return
    }
    setGuardando(true)
    const result = editId
      ? await comercioService.actualizar(editId, form)
      : await comercioService.crear(form)
    setGuardando(false)

    if (result.ok) {
      toast.success(editId ? "Comercio actualizado." : "Comercio creado.")
      setOpen(false)
      reload()
    } else {
      toast.error(result.error)
    }
  }

  async function toggleActivo(c: Comercio) {
    const result = await comercioService.setActivo(c.id, !c.activo)
    if (result.ok) {
      toast.success(c.activo ? "Comercio desactivado." : "Comercio activado.")
      reload()
    } else {
      toast.error(result.error)
    }
  }

  async function eliminar(id: string) {
    const result = await comercioService.eliminar(id)
    if (result.ok) {
      toast.success("Comercio eliminado.")
      reload()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Comercios</h1>
          <p className="text-sm text-muted-foreground">
            Comercios asociados a la plataforma.
          </p>
        </div>
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
                {editId ? "Editar comercio" : "Nuevo comercio"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={guardar} className="grid gap-3 md:grid-cols-2">
              <Field label="Nombre" id="c-nombre">
                <Input
                  id="c-nombre"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </Field>
              <Field label="Descripción" id="c-desc">
                <Input
                  id="c-desc"
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm({ ...form, descripcion: e.target.value })
                  }
                />
              </Field>
              <Field label="Dirección" id="c-dir">
                <Input
                  id="c-dir"
                  value={form.direccion}
                  onChange={(e) =>
                    setForm({ ...form, direccion: e.target.value })
                  }
                />
              </Field>
              <div className="flex gap-3">
                <Field label="Teléfono" id="c-tel" className="flex-1">
                  <Input
                    id="c-tel"
                    value={form.telefono}
                    onChange={(e) =>
                      setForm({ ...form, telefono: e.target.value })
                    }
                  />
                </Field>
                <Field label="Email" id="c-email" className="flex-1">
                  <Input
                    id="c-email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                </Field>
              </div>
              <Field label="Instagram (URL)" id="c-ig">
                <Input
                  id="c-ig"
                  placeholder="https://instagram.com/..."
                  value={form.instagramUrl}
                  onChange={(e) =>
                    setForm({ ...form, instagramUrl: e.target.value })
                  }
                />
              </Field>
              <DialogFooter className="md:col-span-2">
                <Button type="submit" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : !comercios || comercios.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <Store className="size-8" />
          <p className="text-sm">No hay comercios cargados.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {comercios.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{c.nombre}</p>
                    <Badge
                      variant={c.activo ? "default" : "outline"}
                      className={c.activo ? badgeSuccess : undefined}
                    >
                      {c.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  {c.descripcion && (
                    <p className="truncate text-xs text-muted-foreground">
                      {c.descripcion}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[c.direccion, c.telefono, c.email]
                      .filter(Boolean)
                      .join(" · ") || "Sin datos de contacto"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleActivo(c)}
                    aria-label={c.activo ? "Desactivar" : "Activar"}
                  >
                    <Power className="size-4" />
                  </Button>
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
                    title="Eliminar comercio"
                    description={`¿Seguro que querés eliminar "${c.nombre}"? Esta acción no se puede deshacer.`}
                    confirmLabel="Eliminar"
                    destructive
                    onConfirm={() => eliminar(c.id)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  id,
  className,
  children,
}: {
  label: string
  id: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  )
}
