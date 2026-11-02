import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminCreditos } from "@/components/admin/AdminCreditos"
import { AdminHistorial } from "@/components/admin/AdminHistorial"

/** Sección "Operación" del admin: carga de puntos e historial. */
export function AdminOperacion() {
  const [tab, setTab] = useState("puntos")

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 lg:p-8">
      <h1 className="text-lg font-semibold md:text-xl lg:text-2xl">Operación</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="puntos">Cargar puntos</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="puntos" className="mt-4">
          {tab === "puntos" && <AdminCreditos />}
        </TabsContent>
        <TabsContent value="historial" className="mt-4">
          {tab === "historial" && <AdminHistorial />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
