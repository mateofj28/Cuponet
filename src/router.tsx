import { createBrowserRouter } from "react-router-dom"
import { ProtectedRoute } from "@/components/routing/ProtectedRoute"
import { MembershipRoute } from "@/components/routing/MembershipRoute"
import { AdminRoute } from "@/components/routing/AdminRoute"
import { PublicOnlyRoute } from "@/components/routing/PublicOnlyRoute"
import { AppShell } from "@/components/layout/AppShell"
import { Placeholder } from "@/pages/Placeholder"
import { Login } from "@/pages/Login"
import { Registro } from "@/pages/Registro"
import { Home } from "@/pages/Home"
import { Membresia } from "@/pages/Membresia"
import { Cupones } from "@/pages/Cupones"
import { CuponDetalle } from "@/pages/CuponDetalle"
import { Sorteos } from "@/pages/Sorteos"
import { SorteoDetalle } from "@/pages/SorteoDetalle"
import { Historial } from "@/pages/Historial"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { AdminCreditos } from "@/components/admin/AdminCreditos"
import { AdminCupones } from "@/components/admin/AdminCupones"
import { AdminSorteos } from "@/components/admin/AdminSorteos"
import { AdminHistorial } from "@/components/admin/AdminHistorial"
import { AdminDashboard } from "@/components/admin/AdminDashboard"
import { AdminUsuarios } from "@/components/admin/AdminUsuarios"
import { AdminComercios } from "@/components/admin/AdminComercios"
import { AdminEstadisticas } from "@/components/admin/AdminEstadisticas"

/**
 * Rutas de Cuponet (ver design.md).
 * - Públicas: /login, /registro
 * - Protegidas (sesión): /, /membresia, /historial
 * - Protegidas + membresía activa: /cupones, /sorteos
 * - Admin: /admin
 *
 * El Placeholder solo se usa como página 404.
 */
export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/registro", element: <Registro /> },
    ],
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <Home /> },
          { path: "/membresia", element: <Membresia /> },
          { path: "/historial", element: <Historial /> },

          {
            element: <MembershipRoute />,
            children: [
              { path: "/cupones", element: <Cupones /> },
              { path: "/cupones/:id", element: <CuponDetalle /> },
              { path: "/sorteos", element: <Sorteos /> },
              { path: "/sorteos/:id", element: <SorteoDetalle /> },
            ],
          },

          {
            element: <AdminRoute />,
            children: [
              {
                path: "/admin",
                element: <AdminLayout />,
                children: [
                  { index: true, element: <AdminDashboard /> },
                  { path: "usuarios", element: <AdminUsuarios /> },
                  { path: "comercios", element: <AdminComercios /> },
                  { path: "cupones", element: <AdminCupones /> },
                  { path: "sorteos", element: <AdminSorteos /> },
                  { path: "creditos", element: <AdminCreditos /> },
                  { path: "historial", element: <AdminHistorial /> },
                  { path: "estadisticas", element: <AdminEstadisticas /> },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  { path: "*", element: <Placeholder title="Página no encontrada" /> },
])
