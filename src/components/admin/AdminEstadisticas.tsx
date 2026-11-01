import { useMemo, useState } from "react"
import {
  Coins,
  Loader2,
  Ticket,
  TrendingUp,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { adminService } from "@/services"
import { useAsync } from "@/hooks/useAsync"
import { formatCreditos } from "@/lib/format"

type EstadoFiltro = "todos" | "activo" | "cerrado"

interface StatProps {
  label: string
  value: string | number
  icon: LucideIcon
}

function Stat({ label, value, icon: Icon }: StatProps) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <Icon className="size-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold tabular-nums">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminEstadisticas() {
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [estado, setEstado] = useState<EstadoFiltro>("todos")

  const filtro = useMemo(
    () => ({
      desde: desde ? new Date(desde).toISOString() : null,
      hasta: hasta ? new Date(hasta + "T23:59:59").toISOString() : null,
      estado: estado === "todos" ? null : estado,
    }),
    [desde, hasta, estado]
  )

  const { data: stats, loading } = useAsync(
    () => adminService.sorteoStats(filtro),
    [filtro.desde, filtro.hasta, filtro.estado]
  )

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-lg font-semibold">Estadísticas de sorteos</h1>
        <p className="text-sm text-muted-foreground">
          Métricas de participación de la plataforma.
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="grid grid-cols-3 gap-2 p-4">
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Desde</Label>
            <Input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Hasta</Label>
            <Input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Estado</Label>
            <Select
              value={estado}
              onValueChange={(v) => setEstado(v as EstadoFiltro)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="cerrado">Finalizados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Métricas */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : !stats ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No se pudieron cargar las estadísticas.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Sorteos totales" value={stats.sorteosTotal} icon={Trophy} />
          <Stat label="Activos" value={stats.sorteosActivos} icon={Ticket} />
          <Stat
            label="Finalizados"
            value={stats.sorteosFinalizados}
            icon={TrendingUp}
          />
          <Stat
            label="Participaciones"
            value={stats.participaciones}
            icon={TrendingUp}
          />
          <Stat
            label="Participantes"
            value={stats.usuariosParticipantes}
            icon={Users}
          />
          <Stat
            label="Puntos utilizados"
            value={formatCreditos(stats.puntosUtilizados)}
            icon={Coins}
          />
        </div>
      )}
    </div>
  )
}
