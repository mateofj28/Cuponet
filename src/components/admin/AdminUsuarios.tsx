import { useMemo, useState } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Loader2, Search, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { adminService, type UsuarioAdmin } from "@/services"
import { useAsync } from "@/hooks/useAsync"
import { badgeSuccess } from "@/lib/statusBadge"
import { formatCreditos, nombrePlan } from "@/lib/format"

const fechaCorta = (iso: string | null) =>
  iso ? format(parseISO(iso), "d MMM yyyy", { locale: es }) : "—"

function membresiaActiva(u: UsuarioAdmin): boolean {
  if (!u.membresiaExpiracion) return false
  return new Date(u.membresiaExpiracion).getTime() > Date.now()
}

export function AdminUsuarios() {
  const { data: usuarios, loading } = useAsync(
    () => adminService.listarUsuarios(),
    []
  )

  const [texto, setTexto] = useState("")
  const [rol, setRol] = useState("todos")
  const [plan, setPlan] = useState("todos")
  const [estado, setEstado] = useState("todos")

  const filtrados = useMemo(() => {
    const lista = usuarios ?? []
    const q = texto.trim().toLowerCase()
    return lista.filter((u) => {
      if (q) {
        const campos = [u.nombre, u.apellido, u.email, u.dni]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        if (!campos.includes(q)) return false
      }
      if (rol !== "todos" && u.role !== rol) return false
      if (plan !== "todos" && (u.planId ?? "sin") !== plan) return false
      if (estado !== "todos") {
        const activa = membresiaActiva(u)
        if (estado === "activa" && !activa) return false
        if (estado === "vencida" && activa) return false
      }
      return true
    })
  }, [usuarios, texto, rol, plan, estado])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Usuarios</h1>
        <p className="text-sm text-muted-foreground">
          {usuarios ? `${filtrados.length} de ${usuarios.length}` : "—"} usuarios
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Buscar por nombre, email o DNI"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Rol</Label>
              <Select value={rol} onValueChange={setRol}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Plan</Label>
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="plan1">Plan 1</SelectItem>
                  <SelectItem value="plan3">Plan 3</SelectItem>
                  <SelectItem value="black">Plan Black</SelectItem>
                  <SelectItem value="sin">Sin plan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Membresía</Label>
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="activa">Activa</SelectItem>
                  <SelectItem value="vencida">Vencida</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <Users className="size-8" />
          <p className="text-sm">No hay usuarios que coincidan.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtrados.map((u) => (
            <Card key={u.id}>
              <CardContent className="flex flex-col gap-2 p-4 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {u.nombre} {u.apellido ?? ""}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {u.email}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {u.role === "admin" && <Badge variant="secondary">admin</Badge>}
                    <Badge
                      variant={membresiaActiva(u) ? "default" : "outline"}
                      className={membresiaActiva(u) ? badgeSuccess : undefined}
                    >
                      {membresiaActiva(u) ? "Activa" : "Vencida"}
                    </Badge>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <Dato k="DNI" v={u.dni ?? "—"} />
                  <Dato k="Plan" v={nombrePlan(u.planId)} />
                  <Dato k="Registro" v={fechaCorta(u.createdAt)} />
                  <Dato k="Vence" v={fechaCorta(u.membresiaExpiracion)} />
                  <Dato k="Saldo" v={formatCreditos(u.creditos)} />
                  <Dato k="Utilizados" v={formatCreditos(u.puntosUtilizados)} />
                </dl>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="truncate font-medium">{v}</dd>
    </div>
  )
}
