import { NextResponse } from "next/server"

export async function POST() {
  try {
    // El logout se maneja principalmente desde el cliente
    // Esta ruta solo confirma que el logout fue exitoso
    const response = NextResponse.json(
      {
        success: true,
        message: "Sesión cerrada correctamente",
      },
      { status: 200 }
    )

    // Limpiar cookies si las hay
    response.cookies.delete("auth_token")
    response.cookies.delete("session")

    return response
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Error al cerrar sesión" },
      { status: 500 }
    )
  }
}
