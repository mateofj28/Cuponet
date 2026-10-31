import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { authService, type PublicUser } from "@/services"

interface ActionResult {
  ok: boolean
  error?: string
}

interface AuthContextValue {
  user: PublicUser | null
  /** True mientras se resuelve la sesión inicial (evita parpadeo a /login). */
  loading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  membresiaActiva: boolean
  login: (email: string, password: string) => Promise<ActionResult>
  register: (
    nombre: string,
    apellido: string,
    dni: string,
    email: string,
    password: string
  ) => Promise<ActionResult>
  logout: () => Promise<void>
  /** Recarga el perfil (saldo/membresía) tras operaciones que lo cambian. */
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function esMembresiaActiva(user: PublicUser | null): boolean {
  if (!user?.membresia) return false
  return new Date(user.membresia.expiracion).getTime() > Date.now()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Carga la sesión inicial y se suscribe a cambios de auth.
  useEffect(() => {
    let activo = true

    authService.getCurrentUser().then((u) => {
      if (activo) {
        setUser(u)
        setLoading(false)
      }
    })

    const unsub = authService.onAuthChange(async () => {
      const u = await authService.getCurrentUser()
      if (activo) setUser(u)
    })

    return () => {
      activo = false
      unsub()
    }
  }, [])

  const refreshUser = useCallback(async () => {
    setUser(await authService.getCurrentUser())
  }, [])

  const login = useCallback(
    async (email: string, password: string): Promise<ActionResult> => {
      const result = await authService.login(email, password)
      if (result.ok) {
        setUser(result.data)
        return { ok: true }
      }
      return { ok: false, error: result.error }
    },
    []
  )

  const register = useCallback(
    async (
      nombre: string,
      apellido: string,
      dni: string,
      email: string,
      password: string
    ): Promise<ActionResult> => {
      const result = await authService.register({
        nombre,
        apellido,
        dni,
        email,
        password,
      })
      if (result.ok) {
        setUser(result.data)
        return { ok: true }
      }
      return { ok: false, error: result.error }
    },
    []
  )

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: user !== null,
      isAdmin: user?.role === "admin",
      membresiaActiva: esMembresiaActiva(user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, logout, refreshUser]
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>")
  }
  return ctx
}
