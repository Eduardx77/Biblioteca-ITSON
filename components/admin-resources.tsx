"use client"

import { useState, useEffect } from "react"
import { getResources, saveResources, type Resource, type ResourceStatus, type ResourceType } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Pencil, Monitor, DoorOpen } from "lucide-react"

const statusLabels: Record<string, string> = {
  available: "Disponible",
  reserved: "Reservado",
  "in-use": "En uso",
  maintenance: "Mantenimiento",
}

const statusColors: Record<string, string> = {
  available: "bg-accent/15 text-accent",
  reserved: "bg-chart-5/20 text-foreground",
  "in-use": "bg-primary/10 text-primary",
  maintenance: "bg-destructive/10 text-destructive",
}

export function AdminResources() {
  const [resources, setResources] = useState<Resource[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Resource | null>(null)
  const [form, setForm] = useState({ name: "", type: "cubicle" as ResourceType, location: "", status: "available" as ResourceStatus })

  useEffect(() => {
    setResources(getResources())
  }, [])

  function openNew() {
    setEditing(null)
    setForm({ name: "", type: "cubicle", location: "", status: "available" })
    setDialogOpen(true)
  }

  function openEdit(resource: Resource) {
    setEditing(resource)
    setForm({ name: resource.name, type: resource.type, location: resource.location, status: resource.status })
    setDialogOpen(true)
  }

  function handleSave() {
    let updated: Resource[]
    if (editing) {
      updated = resources.map((r) =>
        r.id === editing.id ? { ...r, name: form.name, type: form.type, location: form.location, status: form.status } : r
      )
    } else {
      const newResource: Resource = {
        id: `res_${Date.now()}`,
        name: form.name,
        type: form.type,
        location: form.location,
        status: form.status,
      }
      updated = [...resources, newResource]
    }
    saveResources(updated)
    setResources(updated)
    setDialogOpen(false)
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Gestion de Recursos</CardTitle>
          <Button size="sm" onClick={openNew}>
            <Plus className="mr-1.5 h-4 w-4" />
            Agregar Recurso
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ubicacion</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-20">Accion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {resource.type === "cubicle" ? (
                        <DoorOpen className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium">{resource.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{resource.type === "cubicle" ? "Cubiculo" : "Computadora"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {resource.location}
                    {resource.capacity ? <div className="text-[11px] text-muted-foreground">Capacidad: {resource.capacity}</div> : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[resource.status]}>
                      {statusLabels[resource.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(resource)}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Editar recurso</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Recurso" : "Agregar Recurso"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Nombre</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Cubiculo 7" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as ResourceType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cubicle">Cubiculo</SelectItem>
                  <SelectItem value="computer">Computadora</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Ubicacion</Label>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Ej: Planta Baja - Zona A" />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Estado</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as ResourceStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Disponible</SelectItem>
                  <SelectItem value="reserved">Reservado</SelectItem>
                  <SelectItem value="in-use">En uso</SelectItem>
                  <SelectItem value="maintenance">Mantenimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.location}>{editing ? "Guardar Cambios" : "Agregar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
