import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Missing Supabase credentials. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createAdminUser() {
  try {
    console.log("Creating admin user...")

    // Usar Admin API para crear el usuario
    const { data, error } = await supabase.auth.admin.createUser({
      email: "admin@potros.itson.edu.mx",
      password: "Admin1234",
      email_confirm: true,
      user_metadata: {
        name: "Administrador",
        studentId: "ADMIN001",
        role: "admin",
      },
    })

    if (error) {
      console.error("Error creating auth user:", error.message)
      return
    }

    console.log("Auth user created:", data.user?.id)

    // Crear el perfil en la tabla profiles
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email: "admin@potros.itson.edu.mx",
        student_id: "ADMIN001",
        name: "Administrador",
        role: "admin",
      })

      if (profileError) {
        console.error("Error creating profile:", profileError.message)
        return
      }

      console.log("✅ Admin user created successfully!")
      console.log("Email: admin@potros.itson.edu.mx")
      console.log("Password: Admin1234")
    }
  } catch (err) {
    console.error("Unexpected error:", err)
  }
}

createAdminUser()
