import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import {
  CalendarClock,
  Coins,
  Loader2,
  Ticket,
  Trophy,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { adminService } from "@/services"
import { useAsync } from "@/hooks/useAsync"
import { formatCreditos } from "@/lib/format"
import { BarChart } from "@/components/admin/BarChart"

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  hint?: string
}

function StatCard({ label, value, icon: Icon, hint }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <Icon className="size-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold tabular-nums">{value}</p>
          {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminDashboard() {
  const { data: metrics, loading } = useAsync(
    () => adminService.dashboardMetrics(),
    []
  )
  const { data: serie } = useAsync(
    () => adminService.puntosCargadosSemana(),
    []
  )

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No se pudieron cargar las métricas.
          </CardContent>
        </Card>
      </div>
    )
  }

  const chartData = (serie ?? []).map((d) => ({
    label: format(parseISO(d.dia), "EEEEEE", { locale: es }), // día abreviado
    value: d.total,
  }))

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-lg font-semibold md:text-xl lg:text-2xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Resumen de actividad de la plataforma.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        <StatCard
          label="Usuarios totales"
          value={metrics.totalUsuarios}
          icon={Users}
        />
        <StatCard
          label="Nuevos hoy"
          value={metrics.nuevosHoy}
          icon={UserPlus}
        />
        <StatCard
          label="Membresías activas"
          value={metrics.membresiasActivas}
          icon={CalendarClock}
        />
        <StatCard
          label="Cupones canjeados hoy"
          value={metrics.cuponesCanjeadosHoy}
          icon={Ticket}
        />
        <StatCard
          label="Sorteos"
          value={`${metrics.sorteosActivos} / ${metrics.sorteosFinalizados}`}
          icon={Trophy}
          hint="activos / finalizados"
        />
        <StatCard
          label="Puntos cargados hoy"
          value={formatCreditos(metrics.puntosCargadosHoy)}
          icon={Coins}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Puntos cargados · últimos 7 días
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin datos.</p>
          ) : (
            <BarChart data={chartData} className="h-40" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
