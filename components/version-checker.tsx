'use client'

import { useEffect } from 'react'

export function VersionChecker() {
  useEffect(() => {
    const checkVersion = async () => {
      try {
        // Obtener la versión actual
        const response = await fetch('/api/version', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        })
        const data = await response.json()
        
        // Guardar versión actual
        const savedVersion = localStorage.getItem('app_version')
        
        if (savedVersion && savedVersion !== data.version) {
          console.log('New version detected, reloading app...')
          // Limpiar cache y recargar
          localStorage.clear()
          sessionStorage.clear()
          window.location.reload()
        }
        
        // Guardar la nueva versión
        localStorage.setItem('app_version', data.version)
      } catch (error) {
        console.error('Error checking version:', error)
      }
    }

    // Verificar versión al cargar
    checkVersion()

    // Verificar cada 5 minutos
    const interval = setInterval(checkVersion, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return null
}
