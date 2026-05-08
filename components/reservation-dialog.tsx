"use client"

import React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { createReservation, isResourceAvailable, type Resource } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, CheckCircle2, Monitor, DoorOpen } from "lucide-react"

interface ReservationDialogProps {
  resource: Resource | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ReservationDialog({ resource, open, onOpenChange, onSuccess }: ReservationDialogProps) {
  const { user } = useAuth()
  const today = new Date().toISOString().split("T")[0]
  const [date, setDate] = useState(today)
  const [startTime, setStartTime] = useState("08:00")
  const [endTime, setEndTime] = useState("09:00")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!user || !resource) return

    if (startTime >= endTime) {
      setError("La hora de inicio debe ser anterior a la hora de fin.")
      return
    }

    if (date < today) {
      setError("No puedes reservar en una fecha pasada.")
      return
    }

    if (!isResourceAvailable(resource.id, date, startTime, endTime)) {
      setError("Este recurso ya esta reservado en ese horario. Elige otro horario.")
      return
    }

    createReservation(user.id, resource.id, date, startTime, endTime)
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      onOpenChange(false)
      onSuccess()
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reservar Recurso</DialogTitle>
          <DialogDescription>
            Completa los datos para reservar este recurso.
          </DialogDescription>
        </DialogHeader>

        {resource && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted p-3">
            {resource.type === "cubicle" ? (
              <DoorOpen className="h-5 w-5 text-primary" />
            ) : (
              <Monitor className="h-5 w-5 text-primary" />
            )}
            <div>
              <p className="text-sm font-medium text-foreground">{resource.name}</p>
              <p className="text-xs text-muted-foreground">{resource.location}</p>
              {resource.capacity ? <p className="text-xs text-muted-foreground">Capacidad: {resource.capacity}</p> : null}
            </div>
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
              <CheckCircle2 className="h-6 w-6 text-accent" />
            </div>
            <p className="text-sm font-medium text-foreground">Reservacion creada exitosamente</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Label htmlFor="res-date">Fecha</Label>
              <Input
                id="res-date"
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="res-start">Hora inicio</Label>
                <Input
                  id="res-start"
                  type="time"
                  min="07:00"
                  max="21:00"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="res-end">Hora fin</Label>
                <Input
                  id="res-end"
                  type="time"
                  min="07:00"
                  max="22:00"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">Confirmar Reservacion</Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
