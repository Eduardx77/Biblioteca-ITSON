import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'

const _inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Biblioteca ITSON - Sistema de Reservaciones',
  description: 'Sistema de reservacion de recursos de la Biblioteca ITSON. Consulta disponibilidad de cubiculos y computadoras, realiza y gestiona tus reservaciones.',
}

export const viewport: Viewport = {
  themeColor: '#1a5da6',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
