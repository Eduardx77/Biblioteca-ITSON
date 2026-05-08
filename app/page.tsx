"use client"

import { AuthProvider, useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/login-form"
import { StudentDashboard } from "@/components/student-dashboard"
import { AdminDashboard } from "@/components/admin-dashboard"
import { AppHeader } from "@/components/app-header"
import { Toaster } from "@/components/ui/sonner"

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-muted">
      <AppHeader />
      <main>
        {user.role === "admin" ? <AdminDashboard /> : <StudentDashboard />}
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  )
}
