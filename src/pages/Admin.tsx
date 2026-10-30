import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminCreditos } from "@/components/admin/AdminCreditos"
import { AdminCupones } from "@/components/admin/AdminCupones"
import { AdminSorteos } from "@/components/admin/AdminSorteos"
import { AdminHistorial } from "@/components/admin/AdminHistorial"

export function Admin() {
  const [tab, setTab] = useState("creditos")

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <h1 className="text-lg font-semibold">Panel de administración</h1>
        <p className="text-sm text-muted-foreground">
          Gestión de créditos, cupones, sorteos e historial.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="creditos">Créditos</TabsTrigger>
          <TabsTrigger value="cupones">Cupones</TabsTrigger>
          <TabsTrigger value="sorteos">Sorteos</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="creditos" className="mt-4">
          <AdminCreditos />
        </TabsContent>
        <TabsContent value="cupones" className="mt-4">
          <AdminCupones />
        </TabsContent>
        <TabsContent value="sorteos" className="mt-4">
          <AdminSorteos />
        </TabsContent>
        <TabsContent value="historial" className="mt-4">
          {/* key por tab: al volver a "historial" se remonta y re-consulta,
              así refleja cargas de créditos hechas en otra tab. */}
          {tab === "historial" && <AdminHistorial key={Date.now()} />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
