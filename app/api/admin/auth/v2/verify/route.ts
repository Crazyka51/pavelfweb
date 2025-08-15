import { type NextRequest, NextResponse } from "next/server"
import { verifyAccessToken, getUserById } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid authorization header" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const payload = verifyAccessToken(token)

    if (!payload) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 })
    }

    // Ověření, že uživatel stále existuje a je aktivní
    const user = await getUserById(payload.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found or inactive" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user,
      valid: true,
    })
  } catch (error) {
    console.error("Verify error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
