"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { getNotifications, markAllNotificationsRead } from "@/lib/store"
import { BookOpen, Bell, LogOut, User } from "lucide-react"
import { useState, useEffect } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

export function AppHeader() {
  const { user, logout } = useAuth()
  const [notifications, setNotifications] = useState<ReturnType<typeof getNotifications>>([])
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!user) return
    function refresh() {
      setNotifications(getNotifications(user!.id))
    }
    refresh()
    const interval = setInterval(refresh, 3000)
    return () => clearInterval(interval)
  }, [user, refreshKey])

  const unreadCount = notifications.filter((n) => !n.read).length

  function handleMarkAllRead() {
    if (!user) return
    markAllNotificationsRead(user.id)
    setRefreshKey((k) => k + 1)
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <BookOpen className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-sm font-semibold text-foreground leading-none">Biblioteca ITSON</h1>
          <p className="text-xs text-muted-foreground">Sistema de Reservaciones</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
              <span className="sr-only">Notificaciones</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-semibold text-foreground">Notificaciones</h3>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs" onClick={handleMarkAllRead}>
                  Marcar todo leido
                </Button>
              )}
            </div>
            <ScrollArea className="max-h-72">
              {notifications.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">Sin notificaciones</p>
              ) : (
                <div className="flex flex-col">
                  {notifications
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 10)
                    .map((notif) => (
                      <div
                        key={notif.id}
                        className={`flex flex-col gap-1 border-b border-border px-4 py-3 text-sm last:border-b-0 ${!notif.read ? "bg-primary/5" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-foreground leading-snug">{notif.message}</p>
                          {!notif.read && (
                            <Badge variant="secondary" className="shrink-0 bg-primary/10 text-primary text-[10px]">
                              Nuevo
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notif.createdAt).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </ScrollArea>
          </PopoverContent>
        </Popover>

        <div className="hidden items-center gap-2 border-l border-border pl-2 md:flex">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
            <User className="h-4 w-4 text-secondary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground">{user?.name}</span>
            <span className="text-[10px] text-muted-foreground capitalize">{user?.role === "admin" ? "Administrador" : "Estudiante"}</span>
          </div>
        </div>

        <Button variant="ghost" size="icon" onClick={logout} title="Cerrar sesion">
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Cerrar sesion</span>
        </Button>
      </div>
    </header>
  )
}
