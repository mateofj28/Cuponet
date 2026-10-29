import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

/** Exige rol admin (R7.1). Si no, redirige al inicio. */
export function AdminRoute() {
  const { isAdmin } = useAuth()
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
