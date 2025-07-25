import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const ADMIN_SESSION_COOKIE = "admin-session"
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export interface AdminSession {
  userId: string
  username: string
  isAuthenticated: boolean
  expiresAt: number
}

export async function validateRequest(): Promise<AdminSession | null> {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE)

    if (!sessionCookie) {
      return null
    }

    const session = JSON.parse(sessionCookie.value) as AdminSession

    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      await signOut()
      return null
    }

    return session
  } catch (error) {
    console.error("Session validation error:", error)
    return null
  }
}

export async function createSession(username: string): Promise<AdminSession> {
  const session: AdminSession = {
    userId: "admin",
    username,
    isAuthenticated: true,
    expiresAt: Date.now() + SESSION_DURATION,
  }

  const cookieStore = cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
  })

  return session
}

export async function signOut() {
  const cookieStore = cookies()
  cookieStore.delete(ADMIN_SESSION_COOKIE)
}

export async function requireAuth(): Promise<AdminSession> {
  const session = await validateRequest()

  if (!session) {
    redirect("/admin")
  }

  return session
}

export function validatePassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PAVEL_PASSWORD
  return password === adminPassword
}

export function validateUsername(username: string): boolean {
  const adminUsername = process.env.ADMIN_USERNAME || "admin"
  return username === adminUsername
}

export async function authenticateAdmin(username: string, password: string): Promise<AdminSession | null> {
  if (!validateUsername(username) || !validatePassword(password)) {
    return null
  }

  return await createSession(username)
}

// Middleware helper
export function isAuthenticatedRoute(pathname: string): boolean {
  const protectedRoutes = ["/admin"]
  const publicRoutes = ["/admin/login"]

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return false
  }

  return protectedRoutes.some((route) => pathname.startsWith(route))
}

export function getRedirectUrl(pathname: string): string {
  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    return `/admin?redirect=${encodeURIComponent(pathname)}`
  }
  return "/admin"
}
