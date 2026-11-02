import { NavLink, Outlet, useNavigate } from "react-router-dom"
import {
  BarChart3,
  Coins,
  Home,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Ticket,
  Trophy,
  Volume2,
  VolumeOff,
  History as HistoryIcon,
  type LucideIcon,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { badgeSuccess } from "@/lib/statusBadge"
import { formatCreditos } from "@/lib/format"
import { useSoundPreference } from "@/hooks/useSoundPreference"
import { ClienteSidebar } from "@/components/layout/ClienteSidebar"
import { AdminSidebar } from "@/components/layout/AdminSidebar"

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const clienteNav: NavItem[] = [
  { to: "/", label: "Inicio", icon: Home, end: true },
  { to: "/cupones", label: "Cupones", icon: Ticket },
  { to: "/sorteos", label: "Sorteos", icon: Trophy },
  { to: "/historial", label: "Historial", icon: HistoryIcon },
]

const adminNav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/gestion", label: "Gestión", icon: LayoutGrid },
  { to: "/admin/operacion", label: "Operación", icon: Coins },
  { to: "/admin/metricas", label: "Métricas", icon: BarChart3 },
]

export function AppShell() {
  const { user, isAdmin, membresiaActiva, logout } = useAuth()
  const navigate = useNavigate()
  const { enabled: soundOn, toggle: toggleSound } = useSoundPreference()

  const navItems = isAdmin ? adminNav : clienteNav

  async function handleLogout() {
    await logout()
    toast.success("Sesión cerrada")
    navigate("/login", { replace: true })
  }

  return (
    /**
     * Contenedor raíz:
     * - Móvil:   columna, max-w-md centrado (comportamiento original).
     * - md+:     fila (sidebar + main), sin límite de ancho, ocupa toda la pantalla.
     */
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background md:max-w-none md:flex-row">

      {/* ── Sidebar lateral (solo md+) ───────────────────────────── */}
      {isAdmin ? <AdminSidebar /> : <ClienteSidebar />}

      {/* ── Columna derecha: header + contenido + bottom nav ──────── */}
      <div className="flex min-h-svh flex-1 flex-col overflow-hidden">

        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur md:px-6">
          <div>
            <p className="text-sm font-semibold leading-none md:text-base">Cuponet</p>
            <p className="text-xs text-muted-foreground">
              Hola, {user?.nombre ?? "invitado"}
              {isAdmin && " · Admin"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!isAdmin && (
              <>
                <Badge variant="secondary" className="gap-1">
                  <Coins className="size-3.5" />
                  {formatCreditos(user?.creditos ?? 0)}
                </Badge>
                <Badge
                  variant={membresiaActiva ? "default" : "outline"}
                  className={membresiaActiva ? badgeSuccess : undefined}
                >
                  {membresiaActiva ? "Activa" : "Sin membresía"}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSound}
                  aria-label={soundOn ? "Silenciar sonidos" : "Activar sonidos"}
                  aria-pressed={soundOn}
                >
                  {soundOn ? (
                    <Volume2 className="size-4" />
                  ) : (
                    <VolumeOff className="size-4" />
                  )}
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <Outlet />
        </main>

        {/* Bottom nav — solo visible en móvil (md: hidden) */}
        <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-md items-stretch border-t bg-background md:hidden">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              <Icon className="size-5" />
              {label}
            </NavLink>
          ))}
        </nav>

      </div>
    </div>
  )
}
