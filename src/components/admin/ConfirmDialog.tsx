import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ConfirmDialogProps {
  /** Elemento que dispara la apertura (p. ej. un botón/ícono). */
  trigger: ReactNode
  title: string
  description: string
  /** Texto del botón de confirmación. */
  confirmLabel?: string
  cancelLabel?: string
  /** Si es true, el botón de confirmación usa estilo destructivo. */
  destructive?: boolean
  /** Acción a ejecutar al confirmar. Puede ser async. */
  onConfirm: () => void | Promise<void>
}

/**
 * Diálogo de confirmación reutilizable (cupones, sorteos, comercios).
 * Maneja su propio estado de apertura y el estado "procesando" mientras
 * la acción async se resuelve. Solo ejecuta onConfirm al confirmar.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [procesando, setProcesando] = useState(false)

  async function handleConfirm() {
    setProcesando(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setProcesando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={procesando}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={procesando}
          >
            {procesando ? "Procesando..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
