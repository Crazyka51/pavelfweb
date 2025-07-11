import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export interface AuthUser {
  username: string
  role: string
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      username: decoded.username,
      role: decoded.role,
    }
  } catch (error) {
    return null
  }
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const token = request.cookies.get("admin-token")?.value
  if (!token) return null

  return verifyToken(token)
}

export function requireAuth(request: NextRequest): NextResponse | null {
  // Původně dočasně zakomentováno pro testování, nyní aktivujeme
  const user = getAuthUser(request)
  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: "Neautorizovaný přístup",
      },
      { status: 401 },
    )
  }
  return null
}
