import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value: string // "YYYY-MM-DD" o ""
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  /** Fecha mínima "YYYY-MM-DD". Días anteriores quedan deshabilitados. */
  minDate?: string
  /** Fecha máxima "YYYY-MM-DD". Días posteriores quedan deshabilitados. */
  maxDate?: string
}

/** Selector de solo fecha usando el Calendar de shadcn/ui, en español. */
export function DatePicker({
  value,
  onChange,
  placeholder = "Elegí una fecha",
  className,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)

  const date = value ? new Date(value + "T12:00:00") : undefined
  const min = minDate ? new Date(minDate + "T00:00:00") : undefined
  const max = maxDate ? new Date(maxDate + "T23:59:59") : undefined

  function handleSelect(selected: Date | undefined) {
    if (!selected) {
      onChange("")
    } else {
      const pad = (n: number) => String(n).padStart(2, "0")
      onChange(
        `${selected.getFullYear()}-${pad(selected.getMonth() + 1)}-${pad(selected.getDate())}`
      )
    }
    setOpen(false)
  }

  // Construimos el array de matchers y lo casteamos al tipo que espera el Calendar.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const disabled: any[] = [
    ...(min ? [{ before: min }] : []),
    ...(max ? [{ after: max }] : []),
  ]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {date ? format(date, "d MMM yyyy", { locale: es }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          locale={es}
          disabled={disabled.length > 0 ? disabled : undefined}
          defaultMonth={date ?? min ?? undefined}
        />
      </PopoverContent>
    </Popover>
  )
}
