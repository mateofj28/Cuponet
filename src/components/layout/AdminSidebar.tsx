import { NavLink } from "react-router-dom"
import {
  BarChart3,
  Coins,
  LayoutDashboard,
  LayoutGrid,
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
    items: [{ to: "/admin/gestion", label: "Gestión", icon: LayoutGrid }],
  },
  {
    grupo: "Operación",
    items: [{ to: "/admin/operacion", label: "Operación", icon: Coins }],
  },
  {
    grupo: "Métricas",
    items: [{ to: "/admin/metricas", label: "Métricas", icon: BarChart3 }],
  },
]

/**
 * Sidebar lateral del admin visible en md+.
 * md:  solo íconos (w-16), tooltip nativo.
 * lg:  grupos con ícono + label (w-64).
 */
export function AdminSidebar() {
  return (
    <aside className="hidden md:flex md:w-16 lg:w-64 shrink-0 flex-col border-r bg-background pt-4 gap-1">
      {groups.map((g) => (
        <div key={g.grupo} className="flex flex-col">
          {/* Nombre del grupo — solo visible en lg */}
          <p className="hidden lg:block px-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {g.grupo}
          </p>
          {g.items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              title={label}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                  "hover:bg-muted/60",
                  isActive
                    ? "bg-muted text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              <Icon className="size-5 shrink-0" />
              <span className="hidden lg:block truncate">{label}</span>
            </NavLink>
          ))}
          <div className="mx-4 my-1 hidden lg:block border-t border-border/40" />
        </div>
      ))}
    </aside>
  )
}
