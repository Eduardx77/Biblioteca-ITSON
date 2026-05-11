import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Crear cliente Supabase con service role key si está disponible
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(request: NextRequest) {
  try {
    const { email, role } = await request.json()

    if (!email || !role) {
      return NextResponse.json({ error: "Missing email or role" }, { status: 400 })
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Service role key not configured" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Actualizar el rol en la tabla profiles
    const { error } = await supabase
      .from("profiles")
      .update({ role })
      .eq("email", email)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { success: true, message: `User ${email} role updated to ${role}` },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
