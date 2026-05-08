"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { supabase, hasSupabaseConfig } from "@/lib/supabase-client"
import { getCurrentUser, getUsers, authenticateUser, type User } from "@/lib/store"

interface AuthContextType {
  user: User | null
  login: (identifier: string, password: string) => Promise<User | null>
  logout: () => void
  loading: boolean
  resetPassword: (identifier: string) => Promise<{ success: boolean; message: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function resolveUserByIdentifier(identifier: string): User | null {
  const users = getUsers()
  return users.find((u) => u.email === identifier || u.studentId === identifier) ?? null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      if (hasSupabaseConfig()) {
        const { data } = await supabase.auth.getSession()
        const email = data?.session?.user?.email
        if (email) {
          const supabaseUser = resolveUserByIdentifier(email)
          if (supabaseUser) {
            setUser(supabaseUser)
            setLoading(false)
            return
          }
        }
      }

      const currentUser = getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    }

    loadUser()
  }, [])

  const login = useCallback(async (identifier: string, password: string) => {
    const user = resolveUserByIdentifier(identifier)
    if (!user) return null

    if (hasSupabaseConfig()) {
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      })
      if (error) {
        return null
      }
    } else {
      const authenticated = authenticateUser(identifier, password)
      if (!authenticated) return null
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("itson_current_user", JSON.stringify(user))
    }
    setUser(user)
    return user
  }, [])

  const resetPassword = useCallback(async (identifier: string) => {
    if (!hasSupabaseConfig()) {
      return {
        success: false,
        message: "Supabase no está configurado. No se puede restablecer la contraseña en este momento.",
      }
    }

    const user = resolveUserByIdentifier(identifier)
    const email = user?.email ?? (identifier.includes("@") ? identifier : "")
    if (!email) {
      return {
        success: false,
        message: "No se encontró un usuario con ese ID o correo.",
      }
    }

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}`
        : process.env.NEXT_PUBLIC_SUPABASE_RESET_PASSWORD_REDIRECT_URL ?? ""

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    })

    if (error) {
      return { success: false, message: error.message }
    }

    return {
      success: true,
      message: "Se envió un enlace de restablecimiento a tu correo.",
    }
  }, [])

  const logout = useCallback(async () => {
    if (hasSupabaseConfig()) {
      await supabase.auth.signOut()
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("itson_current_user")
    }
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
