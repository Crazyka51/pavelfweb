import { type NextRequest, NextResponse } from "next/server"

// Tato API route je vždy dynamická, protože pracuje s cookies
export const dynamic = "force-dynamic"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("session")?.value

    if (!token) {
      return NextResponse.json({ error: "Token nenalezen" }, { status: 401 })
    }

    // Ověření JWT tokenu
    const decoded = jwt.verify(token, JWT_SECRET) as any

    return NextResponse.json({
      success: true,
      user: {
        username: decoded.username,
        role: decoded.role,
        displayName: decoded.username === "pavel" ? "Pavel Fišer" : "Administrátor",
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Neplatný token" }, { status: 401 })
  }
}
