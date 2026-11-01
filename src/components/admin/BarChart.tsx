import { cn } from "@/lib/utils"
import { formatAbrev } from "@/lib/format"

interface BarDatum {
  label: string
  value: number
}

/**
 * Gráfico de barras minimalista en CSS (sin dependencias externas).
 * - Valores abreviados encima de cada barra (2.006.900 → "2M").
 * - La barra más alta siempre ocupa el 100% del contenedor.
 * - Tooltip nativo con el valor completo al pasar el cursor.
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
      {data.map((d, i) => {
        const pct = (d.value / max) * 100
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            {/* Valor abreviado encima */}
            <span
              className="text-[10px] font-medium tabular-nums text-muted-foreground"
              title={d.value.toLocaleString("es-AR")}
            >
              {formatAbrev(d.value)}
            </span>
            {/* Barra */}
            <div
              className="w-full rounded-t bg-primary/80 transition-all"
              style={{ height: `${pct}%`, minHeight: d.value > 0 ? 4 : 2 }}
              title={`${d.label}: ${d.value.toLocaleString("es-AR")}`}
            />
            {/* Etiqueta día */}
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}
