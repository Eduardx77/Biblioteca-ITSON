"use client"

import { useState, useEffect } from "react"
import { getResources, type Resource, type ResourceType } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Monitor, DoorOpen, MapPin, CalendarPlus } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const statusLabels: Record<string, string> = {
  available: "Disponible",
  reserved: "Reservado",
  "in-use": "En uso",
  maintenance: "Mantenimiento",
}

const statusColors: Record<string, string> = {
  available: "bg-accent text-accent-foreground",
  reserved: "bg-chart-5 text-foreground",
  "in-use": "bg-primary text-primary-foreground",
  maintenance: "bg-destructive text-destructive-foreground",
}

interface ResourceGridProps {
  onReserve: (resource: Resource) => void
}

export function ResourceGrid({ onReserve }: ResourceGridProps) {
  const [resources, setResources] = useState<Resource[]>([])
  const [filter, setFilter] = useState<"all" | ResourceType>("all")

  useEffect(() => {
    function refresh() {
      setResources(getResources())
    }
    refresh()
    const interval = setInterval(refresh, 3000)
    return () => clearInterval(interval)
  }, [])

  const filtered = filter === "all" ? resources : resources.filter((r) => r.type === filter)

  const availableCount = resources.filter((r) => r.status === "available").length
  const cubiclesAvailable = resources.filter((r) => r.type === "cubicle" && r.status === "available").length
  const computersAvailable = resources.filter((r) => r.type === "computer" && r.status === "available").length

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
              <CalendarPlus className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{availableCount}</p>
              <p className="text-xs text-muted-foreground">Total Disponibles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <DoorOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{cubiclesAvailable}</p>
              <p className="text-xs text-muted-foreground">Cubiculos Disponibles</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Monitor className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{computersAvailable}</p>
              <p className="text-xs text-muted-foreground">Computadoras Disponibles</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recursos</h2>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | ResourceType)}>
          <TabsList>
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="cubicle">Cubiculos</TabsTrigger>
            <TabsTrigger value="computer">Computadoras</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((resource) => (
          <Card key={resource.id} className="overflow-hidden transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {resource.type === "cubicle" ? (
                    <DoorOpen className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Monitor className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="font-medium text-foreground">{resource.name}</span>
                </div>
                <Badge className={statusColors[resource.status]} variant="secondary">
                  {statusLabels[resource.status]}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {resource.location}
              </div>
              {resource.capacity ? (
                <p className="text-xs text-muted-foreground">Capacidad: {resource.capacity}</p>
              ) : null}
              <Button
                size="sm"
                disabled={resource.status !== "available"}
                onClick={() => onReserve(resource)}
                className="mt-1 w-full"
              >
                {resource.status === "available" ? "Reservar" : statusLabels[resource.status]}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
