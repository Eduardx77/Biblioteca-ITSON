"use client"

import { useState, useEffect } from "react"
import { getReservations, getResources, getUsers } from "@/lib/store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { CalendarDays, Users, Monitor, TrendingUp } from "lucide-react"

export function AdminReports() {
  const [stats, setStats] = useState({
    totalReservations: 0,
    activeReservations: 0,
    completedReservations: 0,
    cancelledReservations: 0,
    resourceUsage: [] as { name: string; reservations: number }[],
    statusDistribution: [] as { name: string; value: number }[],
    totalUsers: 0,
    totalResources: 0,
  })

  useEffect(() => {
    const reservations = getReservations()
    const resources = getResources()
    const users = getUsers()

    const active = reservations.filter((r) => r.status === "active" || r.status === "in-use").length
    const completed = reservations.filter((r) => r.status === "completed").length
    const cancelled = reservations.filter((r) => r.status === "cancelled").length

    const usageMap: Record<string, number> = {}
    for (const res of reservations) {
      const resource = resources.find((r) => r.id === res.resourceId)
      const name = resource?.name ?? res.resourceId
      usageMap[name] = (usageMap[name] ?? 0) + 1
    }

    const resourceUsage = Object.entries(usageMap)
      .map(([name, reservations]) => ({ name, reservations }))
      .sort((a, b) => b.reservations - a.reservations)
      .slice(0, 8)

    const statusDistribution = [
      { name: "Activas", value: active },
      { name: "Completadas", value: completed },
      { name: "Canceladas", value: cancelled },
    ].filter((s) => s.value > 0)

    setStats({
      totalReservations: reservations.length,
      activeReservations: active,
      completedReservations: completed,
      cancelledReservations: cancelled,
      resourceUsage,
      statusDistribution,
      totalUsers: users.filter((u) => u.role === "student").length,
      totalResources: resources.length,
    })
  }, [])

  const PIE_COLORS = ["hsl(213, 72%, 40%)", "hsl(165, 60%, 40%)", "hsl(0, 72%, 51%)"]

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalReservations}</p>
              <p className="text-xs text-muted-foreground">Total Reservaciones</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.activeReservations}</p>
              <p className="text-xs text-muted-foreground">Activas Ahora</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Users className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalUsers}</p>
              <p className="text-xs text-muted-foreground">Estudiantes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Monitor className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.totalResources}</p>
              <p className="text-xs text-muted-foreground">Total Recursos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Uso por Recurso</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.resourceUsage.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sin datos de reservaciones aun.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.resourceUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(214, 20%, 88%)",
                      borderRadius: "8px",
                      fontSize: "13px",
                    }}
                  />
                  <Bar dataKey="reservations" fill="hsl(213, 72%, 40%)" radius={[4, 4, 0, 0]} name="Reservaciones" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribucion por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.statusDistribution.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sin datos de reservaciones aun.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={stats.statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {stats.statusDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
