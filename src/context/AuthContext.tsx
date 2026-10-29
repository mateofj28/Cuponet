import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  authService,
  membershipService,
  type PublicUser,
} from "@/services"

interface AuthContextValue {
  user: PublicUser | null
  isAuthenticated: boolean
  isAdmin: boolean
  membresiaActiva: boolean
  login: (email: string, password: string) => { ok: boolean; error?: string }
  register: (
    nombre: string,
    email: string,
    password: string
  ) => { ok: boolean; error?: string }
  logout: () => void
  /** Refresca el user desde el store tras operaciones que cambian saldo/membresía. */
  refreshUser: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(() =>
    authService.getCurrentUser()
  )

  const refreshUser = useCallback(() => {
    setUser(authService.getCurrentUser())
  }, [])

  const login = useCallback((email: string, password: string) => {
    const result = authService.login(email, password)
    if (result.ok) {
      setUser(result.data)
      return { ok: true }
    }
    return { ok: false, error: result.error }
  }, [])

  const register = useCallback(
    (nombre: string, email: string, password: string) => {
      const result = authService.register({ nombre, email, password })
      if (result.ok) {
        setUser(result.data)
        return { ok: true }
      }
      return { ok: false, error: result.error }
    },
    []
  )

  const logout = useCallback(() => {
    authService.logout()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isAdmin: user?.role === "admin",
      membresiaActiva: membershipService.esMembresiaActiva(
        user?.membresia ?? null
      ),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, login, register, logout, refreshUser]
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
