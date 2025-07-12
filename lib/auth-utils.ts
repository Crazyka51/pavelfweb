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
    return null
  }
}

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
  }
}
