export type UserRole = "student" | "admin"

export interface User {
  id: string
  name: string
  email: string
  studentId: string
  role: UserRole
  password: string
}

export type ResourceType = "cubicle" | "computer"
export type ResourceStatus = "available" | "reserved" | "in-use" | "maintenance"

export interface Resource {
  id: string
  name: string
  type: ResourceType
  status: ResourceStatus
  location: string
  capacity?: string
}

export type ReservationStatus = "active" | "completed" | "cancelled" | "in-use"

export interface Reservation {
  id: string
  userId: string
  resourceId: string
  date: string
  startTime: string
  endTime: string
  status: ReservationStatus
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  message: string
  read: boolean
  createdAt: string
  type: "reminder" | "confirmation" | "cancellation" | "warning"
}

// Default data
const defaultResources: Resource[] = [
  // Cubículos en el segundo piso: 6 en Zona A y 2 en Zona B
  { id: "c1", name: "Cubículo 1", type: "cubicle", status: "available", location: "Segundo Piso - Zona A", capacity: "4-6 personas" },
  { id: "c2", name: "Cubículo 2", type: "cubicle", status: "available", location: "Segundo Piso - Zona A", capacity: "4-6 personas" },
  { id: "c3", name: "Cubículo 3", type: "cubicle", status: "available", location: "Segundo Piso - Zona A", capacity: "4-6 personas" },
  { id: "c4", name: "Cubículo 4", type: "cubicle", status: "available", location: "Segundo Piso - Zona A", capacity: "4-6 personas" },
  { id: "c5", name: "Cubículo 5", type: "cubicle", status: "available", location: "Segundo Piso - Zona A", capacity: "4-6 personas" },
  { id: "c6", name: "Cubículo 6", type: "cubicle", status: "available", location: "Segundo Piso - Zona A", capacity: "4-6 personas" },

  // Cubículos en el segundo piso: 2 en Zona B
  { id: "c7", name: "Cubículo 7", type: "cubicle", status: "available", location: "Segundo Piso - Zona B", capacity: "4-6 personas" },
  { id: "c8", name: "Cubículo 8", type: "cubicle", status: "available", location: "Segundo Piso - Zona B", capacity: "4-6 personas" },

  // Área Virtual (pegada a los cubículos) - 14 PCs en el segundo piso
  { id: "p1", name: "PC-01", type: "computer", status: "available", location: "Segundo Piso - Área Virtual" },
  { id: "p2", name: "PC-02", type: "computer", status: "available", location: "Segundo Piso - Área Virtual" },
  { id: "p3", name: "PC-03", type: "computer", status: "available", location: "Segundo Piso - Área Virtual" },
  { id: "p4", name: "PC-04", type: "computer", status: "available", location: "Segundo Piso - Área Virtual" },
  { id: "p5", name: "PC-05", type: "computer", status: "available", location: "Segundo Piso - Área Virtual" },
  { id: "p6", name: "PC-06", type: "computer", status: "available", location: "Segundo Piso - Área Virtual" },
  { id: "p7", name: "PC-07", type: "computer", status: "available", location: "Segundo Piso - Área Virtual" },
  { id: "p8", name: "PC-08", type: "computer", status: "available", location: "Segundo Piso - Área Virtual" },
  { id: "p9", name: "PC-09", type: "computer", status: "available", location: "Segundo Piso - Área Virtual" },
  { id: "p10", name: "PC-10", type: "computer", status: "available", location: "Segundo Piso - Área Virtual" },
  { id: "p11", name: "PC-11", type: "computer", status: "available", location: "Segundo Piso - Área Virtual" },
  { id: "p12", name: "PC-12", type: "computer", status: "available", location: "Segundo Piso - Área Virtual" },
  { id: "p13", name: "PC-13", type: "computer", status: "available", location: "Segundo Piso - Área Virtual" },
  { id: "p14", name: "PC-14", type: "computer", status: "available", location: "Segundo Piso - Área Virtual" },
]

const defaultUsers: User[] = [
  { id: "u1", name: "Carlos Lopez", email: "carlos.lopez@itson.edu.mx", studentId: "000123456", role: "student", password: "123456" },
  { id: "u2", name: "Maria Garcia", email: "maria.garcia@itson.edu.mx", studentId: "000654321", role: "student", password: "123456" },
  { id: "admin1", name: "Admin Biblioteca", email: "admin@itson.edu.mx", studentId: "ADMIN001", role: "admin", password: "admin123" },
]

const RESOURCE_STORAGE_KEY = "itson_resources"
const RESOURCE_VERSION_KEY = "itson_resources_version"
const RESOURCE_DATA_VERSION = 4

function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue
  try {
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored) as T
  } catch {}
  return defaultValue
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

export function getResources(): Resource[] {
  if (typeof window === "undefined") return defaultResources

  try {
    const storedVersion = localStorage.getItem(RESOURCE_VERSION_KEY)
    if (storedVersion !== String(RESOURCE_DATA_VERSION)) {
      localStorage.setItem(RESOURCE_VERSION_KEY, String(RESOURCE_DATA_VERSION))
      localStorage.setItem(RESOURCE_STORAGE_KEY, JSON.stringify(defaultResources))
      return defaultResources
    }

    const stored = localStorage.getItem(RESOURCE_STORAGE_KEY)
    if (stored) return JSON.parse(stored) as Resource[]
  } catch {}

  return defaultResources
}

export function saveResources(resources: Resource[]): void {
  saveToStorage(RESOURCE_STORAGE_KEY, resources)
  if (typeof window !== "undefined") {
    localStorage.setItem(RESOURCE_VERSION_KEY, String(RESOURCE_DATA_VERSION))
  }
}

export function getUsers(): User[] {
  return getFromStorage("itson_users", defaultUsers)
}

export function saveUsers(users: User[]): void {
  saveToStorage("itson_users", users)
}

export function getReservations(): Reservation[] {
  return getFromStorage<Reservation[]>("itson_reservations", [])
}

export function saveReservations(reservations: Reservation[]): void {
  saveToStorage("itson_reservations", reservations)
}

export function getNotifications(userId: string): Notification[] {
  const all = getFromStorage<Notification[]>("itson_notifications", [])
  return all.filter((n) => n.userId === userId)
}

export function addNotification(notification: Omit<Notification, "id" | "createdAt" | "read">): void {
  const all = getFromStorage<Notification[]>("itson_notifications", [])
  all.push({
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    read: false,
    createdAt: new Date().toISOString(),
  })
  saveToStorage("itson_notifications", all)
}

export function markNotificationRead(notifId: string): void {
  const all = getFromStorage<Notification[]>("itson_notifications", [])
  const updated = all.map((n) => (n.id === notifId ? { ...n, read: true } : n))
  saveToStorage("itson_notifications", updated)
}

export function markAllNotificationsRead(userId: string): void {
  const all = getFromStorage<Notification[]>("itson_notifications", [])
  const updated = all.map((n) => (n.userId === userId ? { ...n, read: true } : n))
  saveToStorage("itson_notifications", updated)
}

export function createReservation(
  userId: string,
  resourceId: string,
  date: string,
  startTime: string,
  endTime: string
): Reservation {
  const reservations = getReservations()
  const newRes: Reservation = {
    id: `res_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    userId,
    resourceId,
    date,
    startTime,
    endTime,
    status: "active",
    createdAt: new Date().toISOString(),
  }
  reservations.push(newRes)
  saveReservations(reservations)
  return newRes
}

export function updateReservationStatus(reservationId: string, status: ReservationStatus): void {
  const reservations = getReservations()
  const updated = reservations.map((r) => (r.id === reservationId ? { ...r, status } : r))
  saveReservations(updated)
}

export function cancelReservation(reservationId: string): void {
  updateReservationStatus(reservationId, "cancelled")
}

export function completeReservation(reservationId: string): void {
  updateReservationStatus(reservationId, "completed")
}

export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id)
}

export function getResourceById(id: string): Resource | undefined {
  return getResources().find((r) => r.id === id)
}

export function authenticateUser(identifier: string, password: string): User | null {
  const users = getUsers()
  return (
    users.find(
      (u) =>
        (u.email === identifier || u.studentId === identifier) && u.password === password
    ) || null
  )
}

export function updateResourceStatus(resourceId: string, status: ResourceStatus): void {
  const resources = getResources()
  const updated = resources.map((r) => (r.id === resourceId ? { ...r, status } : r))
  saveResources(updated)
}

export function getAvailableResources(type?: ResourceType): Resource[] {
  const resources = getResources()
  return resources.filter((r) => r.status === "available" && (!type || r.type === type))
}

export function getUserReservations(userId: string): Reservation[] {
  const reservations = getReservations()
  return reservations.filter((r) => r.userId === userId)
}

export function isResourceAvailable(resourceId: string, date: string, startTime: string, endTime: string): boolean {
  const reservations = getReservations()
  const conflictingReservations = reservations.filter(
    (r) =>
      r.resourceId === resourceId &&
      r.date === date &&
      r.status === "active" &&
      ((startTime >= r.startTime && startTime < r.endTime) ||
        (endTime > r.startTime && endTime <= r.endTime) ||
        (startTime <= r.startTime && endTime >= r.endTime))
  )
  return conflictingReservations.length === 0
}

// Authentication functions
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem("itson_current_user")
    if (stored) return JSON.parse(stored) as User
  } catch {}
  return null
}

export function loginUser(identifier: string, password: string): User | null {
  const user = authenticateUser(identifier, password)
  if (user && typeof window !== "undefined") {
    localStorage.setItem("itson_current_user", JSON.stringify(user))
  }
  return user
}

export function logoutUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("itson_current_user")
  }
}

// Resource usage functions
export function startResourceUse(reservationId: string): void {
  updateReservationStatus(reservationId, "in-use")
  // Update resource status to in-use
  const reservation = getReservations().find(r => r.id === reservationId)
  if (reservation) {
    updateResourceStatus(reservation.resourceId, "in-use")
  }
}

export function endResourceUse(reservationId: string): void {
  updateReservationStatus(reservationId, "completed")
  // Update resource status back to available
  const reservation = getReservations().find(r => r.id === reservationId)
  if (reservation) {
    updateResourceStatus(reservation.resourceId, "available")
  }
}