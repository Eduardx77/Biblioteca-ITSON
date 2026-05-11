// Session Manager: Gestiona expiración de sesión y rate limiting

const SESSION_TIMEOUT = 20 * 60 * 1000 // 20 minutos en milisegundos
const RATE_LIMIT_REQUESTS = 100 // máximo de requests
const RATE_LIMIT_WINDOW = 60 * 1000 // en 1 minuto

interface SessionToken {
  userId: string
  createdAt: number
  expiresAt: number
}

interface RateLimitEntry {
  timestamp: number
  count: number
}

let sessionToken: SessionToken | null = null
let lastActivityTime: number = Date.now()
let rateLimitMap: Map<string, RateLimitEntry> = new Map()
let inactivityTimeout: NodeJS.Timeout | null = null

/**
 * Crear un nuevo token de sesión con expiración de 20 minutos
 */
export function createSessionToken(userId: string): SessionToken {
  const now = Date.now()
  sessionToken = {
    userId,
    createdAt: now,
    expiresAt: now + SESSION_TIMEOUT,
  }
  resetInactivityTimer()
  return sessionToken
}

/**
 * Obtener el token actual de sesión
 */
export function getSessionToken(): SessionToken | null {
  if (!sessionToken) return null

  // Verificar si el token ha expirado
  if (Date.now() > sessionToken.expiresAt) {
    clearSession()
    return null
  }

  return sessionToken
}

/**
 * Validar si la sesión es válida
 */
export function isSessionValid(): boolean {
  const token = getSessionToken()
  return token !== null && Date.now() <= token.expiresAt
}

/**
 * Renovar el token de sesión (se ejecuta en cada actividad del usuario)
 */
export function renewSessionToken(): void {
  if (sessionToken) {
    sessionToken.expiresAt = Date.now() + SESSION_TIMEOUT
    resetInactivityTimer()
  }
}

/**
 * Limpiar la sesión
 */
export function clearSession(): void {
  sessionToken = null
  if (inactivityTimeout) {
    clearTimeout(inactivityTimeout)
  }
}

/**
 * Obtener tiempo restante de sesión en segundos
 */
export function getSessionTimeRemaining(): number {
  if (!sessionToken) return 0
  const remaining = Math.max(0, sessionToken.expiresAt - Date.now())
  return Math.ceil(remaining / 1000) // convertir a segundos
}

/**
 * Rate Limiting: Verificar si se ha excedido el límite de requests
 */
export function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || now - entry.timestamp > RATE_LIMIT_WINDOW) {
    // Nueva ventana o primera solicitud
    rateLimitMap.set(identifier, { timestamp: now, count: 1 })
    return true
  }

  if (entry.count >= RATE_LIMIT_REQUESTS) {
    // Se ha excedido el límite
    return false
  }

  entry.count++
  return true
}

/**
 * Resetear el rate limit para un identificador
 */
export function resetRateLimit(identifier: string): void {
  rateLimitMap.delete(identifier)
}

/**
 * Limpiar rate limit expirado (ejecutar periódicamente)
 */
export function cleanupExpiredRateLimits(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now - entry.timestamp > RATE_LIMIT_WINDOW * 2) {
      rateLimitMap.delete(key)
    }
  }
}

/**
 * Resetear el timer de inactividad
 */
function resetInactivityTimer(): void {
  if (inactivityTimeout) {
    clearTimeout(inactivityTimeout)
  }

  lastActivityTime = Date.now()

  // Si la sesión está activa, configurar el logout automático después de inactividad
  if (sessionToken) {
    inactivityTimeout = setTimeout(() => {
      clearSession()
      // Aquí se podría disparar un evento para notificar al usuario
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("SESSION_EXPIRED"))
      }
    }, SESSION_TIMEOUT)
  }
}

/**
 * Actualizar última actividad (llamar en eventos del usuario)
 */
export function recordUserActivity(): void {
  if (isSessionValid()) {
    renewSessionToken()
  }
}
