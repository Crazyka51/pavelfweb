import { type NextRequest, NextResponse } from "next/server"
import { refreshSession } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    // Získání refresh tokenu z cookies
    const refreshToken = request.cookies.get("refreshToken")?.value

    if (!refreshToken) {
      return NextResponse.json({ error: "Refresh token not found" }, { status: 401 })
    }

    // Obnovení session
    const newSession = await refreshSession(refreshToken)
    if (!newSession) {
      return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      accessToken: newSession.accessToken,
      user: newSession.user,
    })
  } catch (error) {
    console.error("Refresh error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
