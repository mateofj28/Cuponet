import { cn } from "@/lib/utils"

interface BarDatum {
  label: string
  value: number
}

/**
 * Gráfico de barras minimalista en CSS (sin dependencias externas).
 * Pensado para series cortas como "puntos cargados por día".
 */
export function BarChart({
  data,
  className,
}: {
  data: BarDatum[]
  className?: string
}) {
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <div className={cn("flex items-end gap-2", className)}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-[10px] font-medium tabular-nums text-muted-foreground">
            {d.value}
          </span>
          <div
            className="w-full rounded-t bg-primary/80"
            style={{ height: `${(d.value / max) * 100}%`, minHeight: 2 }}
            title={`${d.label}: ${d.value}`}
          />
          <span className="text-[10px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  )
}
