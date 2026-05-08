"use client"

import { AdminResources } from "@/components/admin-resources"
import { AdminReservations } from "@/components/admin-reservations"
import { AdminReports } from "@/components/admin-reports"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, CalendarDays, BarChart3 } from "lucide-react"

export function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Panel de Administracion</h1>
        <p className="text-sm text-muted-foreground">Gestiona recursos, reservaciones y genera reportes</p>
      </div>

      <Tabs defaultValue="resources" className="w-full">
        <TabsList>
          <TabsTrigger value="resources" className="flex items-center gap-1.5">
            <Settings className="h-4 w-4" />
            Recursos
          </TabsTrigger>
          <TabsTrigger value="reservations" className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            Reservaciones
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Reportes
          </TabsTrigger>
        </TabsList>
        <TabsContent value="resources" className="mt-4">
          <AdminResources />
        </TabsContent>
        <TabsContent value="reservations" className="mt-4">
          <AdminReservations />
        </TabsContent>
        <TabsContent value="reports" className="mt-4">
          <AdminReports />
        </TabsContent>
      </Tabs>
    </div>
  )
}
