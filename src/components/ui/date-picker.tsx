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
}

/** Selector de solo fecha usando el Calendar de shadcn/ui. */
export function DatePicker({
  value,
  onChange,
  placeholder = "Elegí una fecha",
  className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const date = value ? new Date(value + "T12:00:00") : undefined

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
        />
      </PopoverContent>
    </Popover>
  )
}
