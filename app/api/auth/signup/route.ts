import { NextResponse } from "next/server"
import { supabase, hasSupabaseConfig } from "@/lib/supabase-client"

export async function POST(request: Request) {
  if (!hasSupabaseConfig()) {
    return NextResponse.json(
      { error: "Supabase no está configurado" },
      { status: 400 }
    )
  }

  try {
    const { email, password, name, studentId } = await request.json()

    // Validar campos requeridos
    if (!email || !password || !studentId) {
      return NextResponse.json(
        { error: "Email, contraseña e ID de estudiante son requeridos" },
        { status: 400 }
      )
    }

    // Validar formato de email
    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      )
    }

    // Validar contraseña (mínimo 6 caracteres)
    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          student_id: studentId,
          name: name || email.split("@")[0],
        },
      },
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json(
        { error: authError.message || "Error al crear la cuenta" },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "No se pudo crear la cuenta" },
        { status: 400 }
      )
    }

    // 2. Crear perfil en la base de datos
    const profileName = name || email.split("@")[0]
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        email,
        student_id: studentId,
        name: profileName,
        role: "student",
      })

    if (profileError) {
      console.error("Profile error:", profileError)
      // No fallar si el perfil ya existe
      if (profileError.code !== "23505") {
        return NextResponse.json(
          { error: "Error al crear el perfil" },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Registro completado. Verifica tu correo para confirmar tu cuenta.",
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
