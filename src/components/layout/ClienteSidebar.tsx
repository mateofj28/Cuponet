import { NavLink } from "react-router-dom"
import {
  Home,
  History as HistoryIcon,
  Ticket,
  Trophy,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const items: NavItem[] = [
  { to: "/", label: "Inicio", icon: Home, end: true },
  { to: "/cupones", label: "Cupones", icon: Ticket },
  { to: "/sorteos", label: "Sorteos", icon: Trophy },
  { to: "/historial", label: "Historial", icon: HistoryIcon },
]

/**
 * Sidebar lateral del cliente visible en md+.
 * md:  solo íconos (w-16), tooltip nativo en title.
 * lg:  ícono + label (w-56).
 */
export function ClienteSidebar() {
  return (
    <aside className="hidden md:flex md:w-16 lg:w-56 shrink-0 flex-col border-r bg-background pt-2">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          title={label}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
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
    </aside>
  )
}
