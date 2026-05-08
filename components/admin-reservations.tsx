"use client"

import { useState, useEffect } from "react"
import { getReservations, getResources, getUsers, startResourceUse, endResourceUse, cancelReservation, type Reservation, type Resource, type User } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Square, X } from "lucide-react"

const statusLabels: Record<string, string> = {
  active: "Activa",
  "in-use": "En uso",
  completed: "Completada",
  cancelled: "Cancelada",
}

const statusColors: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  "in-use": "bg-accent/15 text-accent",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
}

export function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")

  function refresh() {
    setReservations(getReservations().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    setResources(getResources())
    setUsers(getUsers())
  }

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 3000)
    return () => clearInterval(interval)
  }, [])

  const filtered = statusFilter === "all" ? reservations : reservations.filter((r) => r.status === statusFilter)

  function getUserName(userId: string) {
    return users.find((u) => u.id === userId)?.name ?? userId
  }

  function getResourceName(resourceId: string) {
    return resources.find((r) => r.id === resourceId)?.name ?? resourceId
  }

  function handleStart(resId: string) {
    startResourceUse(resId)
    refresh()
  }

  function handleEnd(resId: string) {
    endResourceUse(resId)
    refresh()
  }

  function handleCancel(resId: string) {
    cancelReservation(resId)
    refresh()
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">Todas las Reservaciones</CardTitle>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filtrar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="active">Activas</SelectItem>
            <SelectItem value="in-use">En uso</SelectItem>
            <SelectItem value="completed">Completadas</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        {filtered.length === 0 ? (
          <p className="p-6 text-center text-sm text-muted-foreground">No hay reservaciones con este filtro.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((res) => (
                <TableRow key={res.id}>
                  <TableCell className="font-medium">{getUserName(res.userId)}</TableCell>
                  <TableCell>{getResourceName(res.resourceId)}</TableCell>
                  <TableCell>{res.date}</TableCell>
                  <TableCell>{res.startTime} - {res.endTime}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[res.status]}>
                      {statusLabels[res.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {res.status === "active" && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-accent hover:text-accent" onClick={() => handleStart(res.id)} title="Iniciar uso">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleCancel(res.id)} title="Cancelar">
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {res.status === "in-use" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleEnd(res.id)} title="Finalizar uso">
                          <Square className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
