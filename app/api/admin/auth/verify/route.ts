import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin-token")?.value

    console.log("🔍 Token verification:", {
      hasToken: !!token,
      timestamp: new Date().toISOString(),
    })

    if (!token) {
      console.log("❌ No token found")
      return NextResponse.json({ error: "Token nenalezen" }, { status: 401 })
    }

    // Ověření JWT tokenu
    const decoded = jwt.verify(token, JWT_SECRET) as any

    console.log("✅ Token verified for user:", decoded.username)

    return NextResponse.json({
      success: true,
      user: {
        username: decoded.username,
        role: decoded.role,
        displayName: decoded.username === "pavel" ? "Pavel Fišer" : "Administrátor",
      },
    })
  } catch (error) {
    console.error("💥 Token verification error:", error)
    return NextResponse.json({ error: "Neplatný token" }, { status: 401 })
  }
}
