<<<<<<< HEAD
import { jwtVerify, SignJWT } from "jose"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

const SECRET_KEY = process.env.JWT_SECRET
const KEY = new TextEncoder().encode(SECRET_KEY)

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h") // Token expires in 2 hours
    .sign(KEY)
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, KEY, {
      algorithms: ["HS256"],
    })
    return payload
  } catch (error) {
    console.error("Failed to decrypt session:", error)
=======
import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"
import type { AuthUser } from "./types" // Declare or import AuthUser

const JWT_SECRET = process.env.JWT_SECRET || "your-very-long-and-complex-jwt-secret-key-for-production" // Fallback for development

/** Shape encoded in the JWT token */
export interface UserPayload {
  username: string
  // Add other user properties if needed, e.g., role, id
}

/* -------------------------------------------------------------------------- */
/*                          Low-level token helpers                           */
/* -------------------------------------------------------------------------- */

/** Decode & verify token – returns `null` on failure                         */
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return { username: decoded.username, role: decoded.role }
  } catch {
>>>>>>> e2ce699b71320c848c521e54fad10a96370f4230
    return null
  }
}

<<<<<<< HEAD
export async function createSession(userId: string, username: string, role: string) {
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
  const session = await encrypt({ userId, username, role, expiresAt })

  cookies().set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  })
}

export async function deleteSession() {
  cookies().delete("session")
}

export async function getAuthUser() {
  const session = cookies().get("session")?.value
  if (!session) return null
  const decrypted = await decrypt(session)
  if (!decrypted) return null
  return {
    userId: decrypted.userId as string,
    username: decrypted.username as string,
    role: decrypted.role as string,
  }
}

export async function verifyAuth(request: NextRequest) {
  const session = request.cookies.get("session")?.value
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const decrypted = await decrypt(session)
  if (!decrypted) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  // Check if session is expired
  if (decrypted.expiresAt && new Date(decrypted.expiresAt as number) < new Date()) {
    return NextResponse.json({ message: "Session expired" }, { status: 401 })
  }

  return decrypted
}

export function requireAuth(handler: Function, roles?: string[]) {
  return async (request: NextRequest, ...args: any[]) => {
    const authResult = await verifyAuth(request)

    if (authResult instanceof NextResponse) {
      return authResult // Unauthorized response from verifyAuth
    }

    if (roles && !roles.includes(authResult.role as string)) {
      return NextResponse.json({ message: "Forbidden: Insufficient role" }, { status: 403 })
    }

    // Attach user info to the request if needed by the handler
    // For Next.js Route Handlers, you might pass it as an argument or use context
    return handler(request, authResult, ...args)
=======
/** Alias required by some legacy imports                                     */
export const verifyAuthLegacy = verifyToken

/* -------------------------------------------------------------------------- */
/*                      Higher-level request/response utils                   */
/* -------------------------------------------------------------------------- */

/** Extract the auth cookie and return the user or null                      */
export async function getAuthUser(req: NextRequest): Promise<UserPayload | null> {
  const { isAuthenticated, user } = await verifyAuth(req)
  return isAuthenticated ? user : null
}

/**
 * Guard helper for API Route Handlers.
 * Returns a “401 Unauthorized” response when the user is **not** authenticated,
 * otherwise returns `null` so the caller can continue.
 */
export function requireAuth(handler: (req: NextRequest, res: NextResponse) => Promise<NextResponse>) {
  return async (req: NextRequest, res: NextResponse) => {
    const { isAuthenticated } = await verifyAuth(req)
    if (!isAuthenticated) {
      // For API routes, return a 401 response
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), { status: 401 })
    }
    return handler(req, res)
  }
}

// Middleware-like function to require authentication for API routes
export async function verifyAuth(request: NextRequest): Promise<{ isAuthenticated: boolean; user?: UserPayload }> {
  try {
    const token = request.cookies.get("session")?.value

    if (!token) {
      return { isAuthenticated: false }
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))

    // Basic validation of payload
    if (typeof payload.username !== "string") {
      return { isAuthenticated: false }
    }

    return { isAuthenticated: true, user: payload as UserPayload }
  } catch (error) {
    console.error("Authentication verification failed:", error)
    return { isAuthenticated: false }
  }
}

// For Server Components/Actions, you might need a different approach
// This is a simplified version for demonstration
export async function verifySession(): Promise<UserPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get("session")?.value

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
    if (typeof payload.username !== "string") {
      return null
    }
    return payload as UserPayload
  } catch (error) {
    console.error("Session verification failed:", error)
    return null
>>>>>>> e2ce699b71320c848c521e54fad10a96370f4230
  }
}
