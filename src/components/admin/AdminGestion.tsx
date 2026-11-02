import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminUsuarios } from "@/components/admin/AdminUsuarios"
import { AdminComercios } from "@/components/admin/AdminComercios"
import { AdminCupones } from "@/components/admin/AdminCupones"
import { AdminSorteos } from "@/components/admin/AdminSorteos"

/** Sección "Gestión" del admin: usuarios, comercios, cupones y sorteos. */
export function AdminGestion() {
  const [tab, setTab] = useState("usuarios")

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">
      <h1 className="text-lg font-semibold md:text-xl lg:text-2xl">Gestión</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="comercios">Comercios</TabsTrigger>
          <TabsTrigger value="cupones">Cupones</TabsTrigger>
          <TabsTrigger value="sorteos">Sorteos</TabsTrigger>
        </TabsList>
        <TabsContent value="usuarios" className="mt-4">
          {tab === "usuarios" && <AdminUsuarios />}
        </TabsContent>
        <TabsContent value="comercios" className="mt-4">
          {tab === "comercios" && <AdminComercios />}
        </TabsContent>
        <TabsContent value="cupones" className="mt-4">
          {tab === "cupones" && <AdminCupones />}
        </TabsContent>
        <TabsContent value="sorteos" className="mt-4">
          {tab === "sorteos" && <AdminSorteos />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
