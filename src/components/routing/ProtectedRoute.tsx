import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

/** Exige sesión iniciada; si no, redirige a /login. */
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
