"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { getSessionTimeRemaining, renewSessionToken } from "@/lib/session-manager"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock } from "lucide-react"

/**
 * Componente que muestra una alerta cuando la sesión está por expirar
 * y permite renovarla o cerrar sesión
 */
export function SessionWarning() {
  const { logout } = useAuth()
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    // Actualizar el tiempo restante cada segundo
    const interval = setInterval(() => {
      const remaining = getSessionTimeRemaining()
      setTimeRemaining(remaining)

      // Mostrar advertencia si quedan 2 minutos o menos
      if (remaining > 0 && remaining <= 120) {
        setShowWarning(true)
      } else if (remaining > 120) {
        setShowWarning(false)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!showWarning || timeRemaining === null) {
    return null
  }

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60

  const handleRenew = () => {
    renewSessionToken()
    setShowWarning(false)
  }

  return (
    <Alert className="fixed bottom-4 right-4 max-w-sm border-yellow-600 bg-yellow-50">
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertTitle className="text-yellow-800">Tu sesión está por expirar</AlertTitle>
      <AlertDescription className="text-yellow-700 mb-3">
        <div className="flex items-center gap-2 my-2">
          <Clock className="h-4 w-4" />
          <span>
            Tiempo restante: {minutes}m {seconds}s
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={handleRenew} className="bg-yellow-600 hover:bg-yellow-700">
            Renovar sesión
          </Button>
          <Button size="sm" variant="outline" onClick={logout} className="text-red-600 border-red-600 hover:bg-red-50">
            Cerrar sesión
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
