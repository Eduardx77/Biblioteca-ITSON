"use client"

import { useState, useCallback } from "react"
import { ResourceGrid } from "@/components/resource-grid"
import { ReservationDialog } from "@/components/reservation-dialog"
import { MyReservations } from "@/components/my-reservations"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { type Resource } from "@/lib/store"
import { LayoutGrid, CalendarDays } from "lucide-react"

export function StudentDashboard() {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  function handleReserve(resource: Resource) {
    setSelectedResource(resource)
    setDialogOpen(true)
  }

  const handleSuccess = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Panel del Estudiante</h1>
        <p className="text-sm text-muted-foreground">Consulta disponibilidad y reserva recursos de la biblioteca</p>
      </div>

      <Tabs defaultValue="resources" className="w-full">
        <TabsList>
          <TabsTrigger value="resources" className="flex items-center gap-1.5">
            <LayoutGrid className="h-4 w-4" />
            Recursos
          </TabsTrigger>
          <TabsTrigger value="reservations" className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" />
            Mis Reservaciones
          </TabsTrigger>
        </TabsList>
        <TabsContent value="resources" className="mt-4">
          <ResourceGrid key={refreshKey} onReserve={handleReserve} />
        </TabsContent>
        <TabsContent value="reservations" className="mt-4">
          <MyReservations key={refreshKey} />
        </TabsContent>
      </Tabs>

      <ReservationDialog
        resource={selectedResource}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
