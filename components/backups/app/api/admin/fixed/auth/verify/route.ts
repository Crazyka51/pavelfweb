import { type NextRequest, NextResponse } from "next/server"
import { getAuthUser } from "@/lib/auth-utils"

// Tato API route je vždy dynamická, protože pracuje s cookies
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: "Uživatel není přihlášen" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: {
        userId: user.userId,
        username: user.username,
        role: user.role,
        displayName: user.username === "Pavel" ? "Pavel Fišer" : "Administrátor",
      },
    })
  } catch (error) {
    console.error("Error verifying user:", error)
    return NextResponse.json({ error: "Chyba při ověřování uživatele" }, { status: 500 })
  }
}
