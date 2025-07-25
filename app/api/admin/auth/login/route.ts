import { NextResponse } from "next/server"
import { signIn } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    const result = await signIn(username, password)

    if (result.success) {
      // The signIn function already sets the session cookie
      return NextResponse.json({ message: "Login successful" })
    } else {
      return NextResponse.json({ message: result.message || "Invalid credentials" }, { status: 401 })
    }
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
