import { NavLink, Outlet } from "react-router-dom"
import {
  BarChart3,
  Coins,
  LayoutDashboard,
  Store,
  Ticket,
  Trophy,
  Users,
  History as HistoryIcon,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

interface NavGroup {
  grupo: string
  items: NavItem[]
}

const groups: NavGroup[] = [
  {
    grupo: "Resumen",
    items: [{ to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true }],
  },
  {
    grupo: "Gestión",
    items: [
      { to: "/admin/usuarios", label: "Usuarios", icon: Users },
      { to: "/admin/comercios", label: "Comercios", icon: Store },
      { to: "/admin/cupones", label: "Cupones", icon: Ticket },
      { to: "/admin/sorteos", label: "Sorteos", icon: Trophy },
    ],
  },
  {
    grupo: "Operación",
    items: [
      { to: "/admin/creditos", label: "Cargar puntos", icon: Coins },
      { to: "/admin/historial", label: "Historial", icon: HistoryIcon },
    ],
  },
  {
    grupo: "Métricas",
    items: [{ to: "/admin/estadisticas", label: "Estadísticas", icon: BarChart3 }],
  },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors",
    isActive
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  )

/**
 * Layout del panel admin. Navegación agrupada: en desktop como columna
 * lateral; en móvil como fila scrolleable arriba del contenido.
 */
export function AdminLayout() {
  return (
    <div className="flex flex-col gap-4 p-4 md:flex-row">
      {/* Navegación */}
      <nav className="md:w-52 md:shrink-0">
        {/* Móvil: fila horizontal scrolleable con todos los accesos */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:hidden">
          {groups.flatMap((g) =>
            g.items.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                <item.icon className="size-4" />
                {item.label}
              </NavLink>
            ))
          )}
        </div>

        {/* Desktop: grupos en columna */}
        <div className="hidden flex-col gap-4 md:flex">
          {groups.map((g) => (
            <div key={g.grupo} className="flex flex-col gap-1">
              <p className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {g.grupo}
              </p>
              {g.items.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                  <item.icon className="size-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </div>
      </nav>

      {/* Contenido de la sección activa */}
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}
