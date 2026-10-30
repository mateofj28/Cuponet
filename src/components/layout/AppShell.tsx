import { NavLink, Outlet, useNavigate } from "react-router-dom"
import {
  Coins,
  Home,
  LogOut,
  Shield,
  Ticket,
  Trophy,
  Volume2,
  VolumeOff,
  History as HistoryIcon,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { badgeSuccess } from "@/lib/statusBadge"
import { useSoundPreference } from "@/hooks/useSoundPreference"

const navItems = [
  { to: "/", label: "Inicio", icon: Home, end: true },
  { to: "/cupones", label: "Cupones", icon: Ticket, end: false },
  { to: "/sorteos", label: "Sorteos", icon: Trophy, end: false },
  { to: "/historial", label: "Historial", icon: HistoryIcon, end: false },
]

export function AppShell() {
  const { user, isAdmin, membresiaActiva, logout } = useAuth()
  const navigate = useNavigate()
  const { enabled: soundOn, toggle: toggleSound } = useSoundPreference()

  async function handleLogout() {
    await logout()
    toast.success("Sesión cerrada")
    navigate("/login", { replace: true })
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div>
          <p className="text-sm font-semibold leading-none">Cuponet</p>
          <p className="text-xs text-muted-foreground">
            Hola, {user?.nombre ?? "invitado"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Coins className="size-3.5" />
            {user?.creditos ?? 0}
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

      {/* Contenido */}
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      {/* Bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto flex w-full max-w-md items-stretch border-t bg-background">
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
        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            <Shield className="size-5" />
            Admin
          </NavLink>
        )}
      </nav>
    </div>
  )
}
