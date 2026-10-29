import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

/**
 * Para rutas públicas (login/registro): si el usuario ya tiene sesión,
 * lo redirige al inicio en lugar de mostrar el formulario.
 */
export function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
