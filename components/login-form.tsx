"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, AlertCircle } from "lucide-react"

export function LoginForm() {
  const { login, resetPassword } = useAuth()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [forgotMode, setForgotMode] = useState(false)
  const [resetIdentifier, setResetIdentifier] = useState("")
  const [resetStatus, setResetStatus] = useState("")
  const [resetError, setResetError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const savedIdentifier = localStorage.getItem("itson_saved_email") || ""
    const savedPassword = localStorage.getItem("itson_saved_password") || ""
    setIdentifier(savedIdentifier)
    setPassword(savedPassword)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)
    if (!identifier.toLowerCase().endsWith("@potros.itson.edu.mx")) {
      setError("Solo se permite correo @potros.itson.edu.mx")
      setIsSubmitting(false)
      return
    }

    try {
      const user = await login(identifier, password)
      if (!user) {
        setError("Credenciales incorrectas. Intenta de nuevo.")
        return
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("itson_saved_email", identifier)
        localStorage.setItem("itson_saved_password", password)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setResetError("")
    setResetStatus("")

    const target = resetIdentifier || identifier
    if (!target) {
      setResetError("Ingresa tu correo electrónico para restablecer la contraseña.")
      return
    }

    const result = await resetPassword(target)
    if (result.success) {
      setResetStatus(result.message)
      setResetError("")
    } else {
      setResetStatus("")
      setResetError(result.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="flex w-full max-w-md flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <BookOpen className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground text-balance text-center">
            Biblioteca ITSON
          </h1>
          <p className="text-sm text-muted-foreground text-center text-pretty">
            Sistema de Reservacion de Recursos
          </p>
        </div>

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Iniciar Sesion</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Label htmlFor="identifier">Correo electrónico</Label>
                <Input
                  id="identifier"
                  type="email"
                  placeholder="nombre.apellido@potros.itson.edu.mx"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Iniciando..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-6 flex flex-col gap-3 text-sm">
              {forgotMode ? (
                <form onSubmit={handleResetPassword} className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Ingresa tu correo electrónico para recibir el enlace de restablecimiento.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="resetIdentifier">Correo electrónico</Label>
                    <Input
                      id="resetIdentifier"
                      type="email"
                      placeholder="nombre.apellido@potros.itson.edu.mx"
                      value={resetIdentifier}
                      onChange={(e) => setResetIdentifier(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="submit" className="w-full sm:w-auto">
                      Enviar enlace
                    </Button>
                    <button
                      type="button"
                      className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
                      onClick={() => {
                        setForgotMode(false)
                        setResetIdentifier("")
                        setResetStatus("")
                        setResetError("")
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                  {resetStatus && (
                    <p className="text-xs text-success">{resetStatus}</p>
                  )}
                  {resetError && (
                    <p className="text-xs text-destructive">{resetError}</p>
                  )}
                </form>
              ) : (
                <button
                  type="button"
                  className="text-left text-sm font-medium text-primary underline-offset-4 hover:underline"
                  onClick={() => setForgotMode(true)}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
