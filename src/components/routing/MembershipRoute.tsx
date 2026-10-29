import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

/**
 * Exige membresía activa (R2.5). Si no la tiene, redirige a /membresia
 * para comprar/renovar. Asume que ya pasó por ProtectedRoute.
 */
export function MembershipRoute() {
  const { membresiaActiva } = useAuth()
  if (!membresiaActiva) {
    return <Navigate to="/membresia" replace />
  }
  return <Outlet />
}
