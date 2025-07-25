import { NextResponse } from "next/server"
import { signOut } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    await signOut()
    return NextResponse.json({ message: "Logout successful" })
  } catch (error) {
    console.error("Logout API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
