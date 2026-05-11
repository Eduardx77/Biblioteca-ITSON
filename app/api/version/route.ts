import { NextResponse } from 'next/server'

export async function GET() {
  // Usar el timestamp actual como versión
  // En producción, esto podría venir de un archivo de configuración o una variable de entorno
  const version = process.env.NEXT_PUBLIC_APP_VERSION || new Date().toISOString().split('T')[0]
  
  return NextResponse.json({ version }, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
}
