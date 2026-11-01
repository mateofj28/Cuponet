import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface DateTimePickerProps {
  /** Valor en ISO string o string datetime-local "YYYY-MM-DDTHH:mm". */
  value: string
  onChange: (value: string) => void
  label?: string
  id?: string
}

/**
 * Date+time picker usando el Calendar de shadcn/ui (no el nativo del browser).
 * Muestra un Popover con el Calendar para la fecha y un input de hora separado.
 */
export function DateTimePicker({
  value,
  onChange,
  label,
  id,
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)

  // Parsea el valor actual en fecha y hora.
  const date = value ? new Date(value) : undefined
  const timeStr = date
    ? `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
    : "00:00"

  function handleDaySelect(selected: Date | undefined) {
    if (!selected) return
    const [h, m] = timeStr.split(":").map(Number)
    selected.setHours(h, m, 0, 0)
    onChange(toDateTimeLocal(selected))
    setOpen(false)
  }

  function handleTimeChange(t: string) {
    const base = date ?? new Date()
    const [h, m] = t.split(":").map(Number)
    base.setHours(isNaN(h) ? 0 : h, isNaN(m) ? 0 : m, 0, 0)
    onChange(toDateTimeLocal(base))
  }

  return (
    <div className="flex flex-col gap-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="flex gap-2">
        {/* Selector de fecha */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id={id}
              type="button"
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 size-4" />
              {date
                ? format(date, "d 'de' MMMM yyyy", { locale: es })
                : "Elegí una fecha"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDaySelect}
            />
          </PopoverContent>
        </Popover>

        {/* Input de hora */}
        <Input
          type="time"
          value={timeStr}
          onChange={(e) => handleTimeChange(e.target.value)}
          className="w-28 shrink-0"
        />
      </div>
    </div>
  )
}

/** Convierte un Date a string "YYYY-MM-DDTHH:mm" (formato datetime-local). */
function toDateTimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
