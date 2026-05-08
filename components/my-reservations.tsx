"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getReservations, getResources, cancelReservation, type Reservation, type Resource } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CalendarDays, Clock, X } from "lucide-react"

const statusLabels: Record<string, string> = {
  active: "Activa",
  "in-use": "En uso",
  completed: "Completada",
  cancelled: "Cancelada",
}

const statusVariants: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  "in-use": "bg-accent/15 text-accent",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
}

export function MyReservations() {
  const { user } = useAuth()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [cancelId, setCancelId] = useState<string | null>(null)

  useEffect(() => {
    function refresh() {
      if (!user) return
      const allRes = getReservations().filter((r) => r.userId === user.id)
      setReservations(allRes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      setResources(getResources())
    }
    refresh()
    const interval = setInterval(refresh, 3000)
    return () => clearInterval(interval)
  }, [user])

  function handleCancel() {
    if (!cancelId) return
    cancelReservation(cancelId)
    setCancelId(null)
    setReservations(getReservations().filter((r) => r.userId === user?.id))
  }

  function getResourceName(resourceId: string) {
    return resources.find((r) => r.id === resourceId)?.name ?? resourceId
  }

  function getResourceLocation(resourceId: string) {
    return resources.find((r) => r.id === resourceId)?.location ?? ""
  }

  function getRemainingTime(reservation: Reservation): string | null {
    if (reservation.status !== "active" && reservation.status !== "in-use") return null
    const now = new Date()
    const endDate = new Date(`${reservation.date}T${reservation.endTime}:00`)
    const diff = endDate.getTime() - now.getTime()
    if (diff <= 0) return "Tiempo agotado"
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    if (hours > 0) return `${hours}h ${minutes}min restantes`
    return `${minutes}min restantes`
  }

  if (reservations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12">
          <CalendarDays className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No tienes reservaciones aun.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mis Reservaciones</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recurso</TableHead>
                <TableHead>Ubicacion</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Tiempo</TableHead>
                <TableHead className="w-20">Accion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((res) => {
                const remaining = getRemainingTime(res)
                return (
                  <TableRow key={res.id}>
                    <TableCell className="font-medium">{getResourceName(res.resourceId)}</TableCell>
                    <TableCell className="text-muted-foreground">{getResourceLocation(res.resourceId)}</TableCell>
                    <TableCell>{res.date}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {res.startTime} - {res.endTime}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusVariants[res.status]}>
                        {statusLabels[res.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{remaining ?? "-"}</TableCell>
                    <TableCell>
                      {(res.status === "active") && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setCancelId(res.id)}>
                          <X className="h-4 w-4" />
                          <span className="sr-only">Cancelar reservacion</span>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Reservacion</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. El recurso quedara disponible para otros usuarios.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, mantener</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Si, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
