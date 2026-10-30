import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { FullScreenLoader } from "@/components/layout/FullScreenLoader"

/**
 * Para rutas públicas (login/registro): si el usuario ya tiene sesión,
 * lo redirige al inicio en lugar de mostrar el formulario.
 */
export function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <FullScreenLoader />
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
