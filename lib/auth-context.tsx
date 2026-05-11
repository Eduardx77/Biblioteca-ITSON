"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { supabase, hasSupabaseConfig } from "@/lib/supabase-client"
import { getCurrentUser, getUsers, authenticateUser, type User } from "@/lib/store"
import {
  createSessionToken,
  getSessionToken,
  clearSession,
  checkRateLimit,
  recordUserActivity,
  isSessionValid,
} from "@/lib/session-manager"

interface AuthContextType {
  user: User | null
  login: (identifier: string, password: string) => Promise<User | null>
  logout: () => void
  loading: boolean
  resetPassword: (identifier: string) => Promise<{ success: boolean; message: string }>
  sessionValid: boolean
}

type SupabaseProfile = {
  id: string
  email: string | null
  student_id: string | null
  name: string | null
  role: User["role"] | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function mapProfile(profile: SupabaseProfile): User {
  return {
    id: profile.id,
    name: profile.name || "Usuario",
    email: profile.email || "",
    studentId: profile.student_id || "",
    role: profile.role || "student",
    password: "",
  }
}

function formatNameFromIdentifier(identifier: string): string {
  const username = identifier.split("@")[0]
  const cleaned = username
    .replace(/[0-9]/g, "")
    .replace(/[._-]+/g, " ")
    .trim()

  if (!cleaned) return "Usuario"

  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ")
}

function isAllowedSupabaseEmail(identifier: string): boolean {
  return identifier.toLowerCase().endsWith("@potros.itson.edu.mx")
}

async function getSupabaseProfile(identifier: string): Promise<User | null> {
  try {
    // Primero intenta buscar por email
    const emailPromise = (supabase
      .from("profiles")
      .select("id,email,student_id,name,role")
      .eq("email", identifier)
      .maybeSingle()) as any
    
    const emailTimeout = new Promise<any>((resolve) =>
      setTimeout(() => resolve({ data: null, error: { message: "timeout" } }), 10000)
    )
    
    const emailResult = await Promise.race([emailPromise, emailTimeout])
    const { data: emailData, error: emailError } = emailResult

    if (!emailError && emailData) {
      console.log(`Profile found by email (${identifier}):`, emailData)
      return mapProfile(emailData)
    }

    // Si no encuentra por email, intenta por student_id
    const idPromise = (supabase
      .from("profiles")
      .select("id,email,student_id,name,role")
      .eq("student_id", identifier)
      .maybeSingle()) as any
    
    const idTimeout = new Promise<any>((resolve) =>
      setTimeout(() => resolve({ data: null, error: { message: "timeout" } }), 10000)
    )
    
    const idResult = await Promise.race([idPromise, idTimeout])
    const { data: idData, error: idError } = idResult

    if (!idError && idData) {
      console.log(`Profile found by student_id (${identifier}):`, idData)
      return mapProfile(idData)
    }

    console.log(`No profile found for identifier: ${identifier}`)
    return null
  } catch (error) {
    console.error("Error fetching Supabase profile:", error)
    return null
  }
}

async function resolveUserByIdentifier(identifier: string): Promise<User | null> {
  if (hasSupabaseConfig()) {
    const supabaseUser = await getSupabaseProfile(identifier)
    if (supabaseUser) return supabaseUser
  }

  const users = getUsers()
  return users.find((u) => u.email === identifier || u.studentId === identifier) ?? null
}

async function resolveUserEmail(identifier: string): Promise<string | null> {
  if (identifier.includes("@")) return identifier
  if (hasSupabaseConfig()) {
    const supabaseUser = await getSupabaseProfile(identifier)
    if (supabaseUser) return supabaseUser.email
  }

  const localUser = getUsers().find((u) => u.studentId === identifier)
  return localUser?.email ?? null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionValid, setSessionValid] = useState(true)

  useEffect(() => {
    async function loadUser() {
      try {
        // Verificar si hay sesión válida
        if (!isSessionValid()) {
          setLoading(false)
          return
        }

        if (hasSupabaseConfig()) {
          try {
            // Timeout para getSession (3 segundos máximo)
            const sessionPromise = supabase.auth.getSession()
            const timeoutPromise = new Promise((resolve) =>
              setTimeout(() => resolve({ data: null }), 3000)
            )
            const result = await Promise.race([sessionPromise, timeoutPromise])
            const data = (result as any)?.data
            
            const email = data?.session?.user?.email
            if (email) {
              const supabaseUser = await resolveUserByIdentifier(email)
              if (supabaseUser) {
                setUser(supabaseUser)
                setSessionValid(true)
                setLoading(false)
                return
              }
            }
          } catch (err) {
            console.debug("Error getting Supabase session, using local fallback:", err)
          }
        }

        // Fallback local
        const currentUser = getCurrentUser()
        setUser(currentUser)
        setSessionValid(true)
        setLoading(false)
      } catch (err) {
        console.error("Error in loadUser:", err)
        setUser(null)
        setSessionValid(false)
        setLoading(false)
      }
    }

    loadUser()

    // Escuchar evento de expiración de sesión
    const handleSessionExpired = () => {
      setUser(null)
      setSessionValid(false)
      if (typeof window !== "undefined") {
        localStorage.removeItem("itson_current_user")
      }
    }

    window.addEventListener("SESSION_EXPIRED", handleSessionExpired)

    // Escuchar actividad del usuario para renovar sesión
    const handleUserActivity = () => {
      recordUserActivity()
    }

    const events = ["click", "keydown", "mousemove", "touchstart"]
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity)
    })

    if (hasSupabaseConfig()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user?.email) {
          const supabaseUser = await resolveUserByIdentifier(session.user.email)
          if (supabaseUser) {
            setUser(supabaseUser)
            setSessionValid(true)
          }
        } else {
          setUser(null)
          setSessionValid(false)
        }
      })

      return () => {
        subscription.unsubscribe()
        window.removeEventListener("SESSION_EXPIRED", handleSessionExpired)
        events.forEach((event) => {
          window.removeEventListener(event, handleUserActivity)
        })
      }
    }

    return () => {
      window.removeEventListener("SESSION_EXPIRED", handleSessionExpired)
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity)
      })
    }
  }, [])

  const login = useCallback(async (identifier: string, password: string) => {
    console.time("Login Flow")

    // Verificar rate limiting
    if (!checkRateLimit(identifier)) {
      console.warn(`Rate limit exceeded for ${identifier}`)
      return null // Demasiadas intentos de login
    }

    if (hasSupabaseConfig() && identifier.includes("@")) {
      if (!isAllowedSupabaseEmail(identifier)) {
        throw new Error("Solo se permite correo @potros.itson.edu.mx")
      }

      let finalUser: User | null = null

      try {
        console.time("Supabase Login")
        const signInResult = await supabase.auth.signInWithPassword({
          email: identifier,
          password,
        })
        console.timeEnd("Supabase Login")

        const { data: signInData, error: signInError } = signInResult

        if (signInError) {
          console.log("Login failed:", signInError.message)
          console.log("Sign-in error details:", signInError)

          console.log("Attempting auto-signup for:", identifier)
          const studentId = identifier.split("@")[0]
          const name = formatNameFromIdentifier(identifier)

          const signUpResult = await supabase.auth.signUp({
            email: identifier,
            password,
            options: {
              data: {
                student_id: studentId,
                name,
              },
            },
          })

          const { data: signUpData, error: signUpError } = signUpResult
          console.log("Supabase signup result:", signUpData, signUpError)

          if (signUpError) {
            console.error("Signup failed:", signUpError.message)
            if (signUpError.message?.toLowerCase().includes("already")) {
              console.warn("User already exists in auth but login failed for:", identifier)

              const retrySignIn = await supabase.auth.signInWithPassword({
                email: identifier,
                password,
              })
              if (!retrySignIn.error && retrySignIn.data.user) {
                const existingUser = retrySignIn.data.user
                const profile: SupabaseProfile = {
                  id: existingUser.id,
                  email: identifier,
                  student_id: studentId,
                  name: existingUser.user_metadata?.name || name,
                  role: "student",
                }
                const { error: profileInsertError } = await supabase.from("profiles").insert(profile)
                if (profileInsertError && profileInsertError.code !== "23505") {
                  console.error("Profile creation failed after retry sign-in:", profileInsertError)
                  return null
                }
                finalUser = await getSupabaseProfile(identifier)
                if (!finalUser) {
                  console.error("Failed to fetch profile after retry sign-in")
                  return null
                }
                return finalUser
              }
            }
            return null
          }

          const newUser = signUpData.user ?? signUpData.session?.user
          if (!newUser) {
            console.error("Signup succeeded but no authenticated user returned")
            return null
          }

          const profile: SupabaseProfile = {
            id: newUser.id,
            email: identifier,
            student_id: studentId,
            name,
            role: "student",
          }

          const { error: profileInsertError } = await supabase.from("profiles").insert(profile)
          if (profileInsertError && profileInsertError.code !== "23505") {
            console.error("Profile creation failed:", profileInsertError)
            return null
          }

          finalUser = await getSupabaseProfile(identifier)
          if (!finalUser) {
            console.error("Failed to fetch profile after signup")
            return null
          }
        } else {
          finalUser = await getSupabaseProfile(identifier)

          if (!finalUser) {
            console.log("User logged in but profile missing, creating profile...")
            const userId = signInData.user.id
            const profile: SupabaseProfile = {
              id: userId,
              email: identifier,
              student_id: identifier.split("@")[0],
              name: signInData.user.user_metadata?.name || formatNameFromIdentifier(identifier),
              role: "student",
            }

            const { error: profileInsertError } = await supabase.from("profiles").insert(profile)
            if (profileInsertError && profileInsertError.code !== "23505") {
              console.error("Profile creation failed:", profileInsertError)
              return null
            }

            finalUser = await getSupabaseProfile(identifier)
            if (!finalUser) {
              console.error("Failed to fetch profile after login")
              return null
            }
          }
        }

        if (!finalUser) {
          console.error("Failed to get final user profile after login for:", identifier)
          return null
        }
      } catch (err) {
        console.error("Login error:", err, "Identifier:", identifier)
        return null
      }

      console.log("Login successful for user:", finalUser)

      // Crear token de sesión con expiración de 20 minutos
      createSessionToken(finalUser.id)

      if (typeof window !== "undefined") {
        localStorage.setItem("itson_current_user", JSON.stringify(finalUser))
      }
      setUser(finalUser)
      setSessionValid(true)
      console.timeEnd("Login Flow")
      return finalUser
    } else {
      // Sistema local como fallback
      const authenticated = authenticateUser(identifier, password)
      if (!authenticated) return null

      const user = await resolveUserByIdentifier(identifier)
      if (!user) return null

      // Crear token de sesión
      createSessionToken(user.id)

      if (typeof window !== "undefined") {
        localStorage.setItem("itson_current_user", JSON.stringify(user))
      }
      setUser(user)
      setSessionValid(true)
      return user
    }
  }, [])

  const resetPassword = useCallback(async (identifier: string) => {
    if (!hasSupabaseConfig()) {
      return {
        success: false,
        message: "Supabase no está configurado. No se puede restablecer la contraseña en este momento.",
      }
    }

    if (identifier.includes("@") && !isAllowedSupabaseEmail(identifier)) {
      return {
        success: false,
        message: "Solo se permite correo @potros.itson.edu.mx",
      }
    }

    const email = await resolveUserEmail(identifier)
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
    try {
      if (hasSupabaseConfig()) {
        await supabase.auth.signOut()
      }

      // Llamar endpoint de logout
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).catch(() => {
        // Si el endpoint falla, continuar de todas formas
      })

      // Limpiar sesión
      clearSession()

      if (typeof window !== "undefined") {
        localStorage.removeItem("itson_current_user")
      }
      setUser(null)
      setSessionValid(false)
    } catch (error) {
      console.error("Error durante logout:", error)
      // Asegurar que al menos se limpie el estado local
      setUser(null)
      setSessionValid(false)
    }
  }, [])

  // Manejar logout automático al cerrar la ventana con 5 segundos de gracia
  useEffect(() => {
    if (typeof window === "undefined") return

    let logoutTimeout: NodeJS.Timeout | null = null
    let beforeUnloadFired = false

    const handleBeforeUnload = () => {
      beforeUnloadFired = true
      // Iniciar timeout de 5 segundos para logout
      logoutTimeout = setTimeout(() => {
        logout()
      }, 5000)
    }

    const handleVisibilityChange = () => {
      // Si la pestaña se vuelve visible, cancelar el logout
      if (!document.hidden && logoutTimeout) {
        clearTimeout(logoutTimeout)
        logoutTimeout = null
        beforeUnloadFired = false
      }
    }

    const handleFocus = () => {
      // Si la ventana recupera el foco, cancelar el logout
      if (logoutTimeout) {
        clearTimeout(logoutTimeout)
        logoutTimeout = null
        beforeUnloadFired = false
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
      if (logoutTimeout) clearTimeout(logoutTimeout)
    }
  }, [logout])

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, resetPassword, sessionValid }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
