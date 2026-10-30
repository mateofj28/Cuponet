import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { FullScreenLoader } from "@/components/layout/FullScreenLoader"

/** Exige sesión iniciada; si no, redirige a /login. */
export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth()

  // Mientras se resuelve la sesión inicial, no redirigir (evita sacar al
  // usuario a /login al recargar la página).
  if (loading) return <FullScreenLoader />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
